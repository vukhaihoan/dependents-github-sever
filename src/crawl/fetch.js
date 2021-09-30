/* Basic example of saving cookie using axios in node.js and session's recreation after expiration.
 * We have to getting/saving cookie manually because WithCredential axios param use XHR and doesn't work in node.js
 * Also, this example supports parallel request and send only one create session request.
 * */

const axios = require("axios").default;
const axiosRetry = require("axios-retry");
const BASE_URL = "https://github.com/";

// Init instance of axios which works with BASE_URL
const axiosInstance = axios.create({ baseURL: BASE_URL });

const createSession = async () => {
  console.log("create session");
  const resp = await axios.get(BASE_URL);
  const [cookie] = resp.headers["set-cookie"]; // getting cookie from request
  axiosInstance.defaults.headers.Cookie = cookie; // attaching cookie to axiosInstance for future requests
  return cookie; // return Promise<cookie> because func is async
};

let isGetActiveSessionRequest = false;
let requestQueue = [];

const callRequestsFromQueue = (cookie) => {
  requestQueue.forEach((sub) => sub(cookie));
};
const addRequestToQueue = (sub) => {
  requestQueue.push(sub);
};
const clearQueue = () => {
  requestQueue = [];
};

// registering axios interceptor which handle response's errors
axiosInstance.interceptors.response.use(null, (error) => {
  console.error(error.message); //logging here

  const { response = {}, config: sourceConfig } = error;

  // checking if request failed cause Unauthorized
  if (response.status === 401) {
    // if this request is first we set isGetActiveSessionRequest flag to true and run createSession
    if (!isGetActiveSessionRequest) {
      isGetActiveSessionRequest = true;
      createSession()
        .then((cookie) => {
          // when createSession resolve with cookie value we run all request from queue with new cookie
          isGetActiveSessionRequest = false;
          callRequestsFromQueue(cookie);
          clearQueue(); // and clean queue
        })
        .catch((e) => {
          isGetActiveSessionRequest = false; // Very important!
          console.error("Create session error %s", e.message);
          clearQueue();
        });
    }

    // and while isGetActiveSessionRequest equal true we create and return new promise
    const retryRequest = new Promise((resolve) => {
      // we push new function to queue
      addRequestToQueue((cookie) => {
        // function takes one param 'cookie'
        console.log(
          "Retry with new session context %s request to %s",
          sourceConfig.method,
          sourceConfig.url
        );
        sourceConfig.headers.Cookie = cookie; // setting cookie to header
        resolve(axios(sourceConfig)); // and resolve promise with axios request by old config with cookie
        // we resolve exactly axios request - NOT axiosInstance's request because it could call recursion
      });
    });

    return retryRequest;
  } else {
    // if error is not related with Unauthorized we just reject promise
    return Promise.reject(error);
  }
});
axiosRetry(axiosInstance, {
  retries: 20,
  retryCondition: (e) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(e) ||
      e.response.status === 429
    );
  },
  //   retryDelay: axiosRetry.exponentialDelay,
  retryDelay: (retryCount, error) => {
    if (error.response) {
      const retry_after = error.response.headers["retry-after"];
      if (retry_after) {
        return Number(retry_after) + 1000;
      }
    }
    return axiosRetry.exponentialDelay(retryCount, error);
  },
});
module.exports = { createSession, axiosInstance };
