var express = require("express");
var router = express.Router();
const { body, query, validationResult } = require("express-validator");

const {
  sortDependents,
  getProjectTime,
  fetchMutipleData,
} = require("./crawl/main");
const { state } = require("./state/index");

function splitUrl(url) {
  let arrUrl = url.split("/");
  newUrl = "https://github.com/" + arrUrl[3] + "/" + arrUrl[4];
  return newUrl;
}

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  next();
});

router.get("/", function (req, res) {
  res.send("oke");
});

router.get(
  "/sort",
  query("url").isURL(),
  query("type").isString().trim(),
  query("start").isInt({ min: 0 }).toInt(),
  query("end").isInt({ min: 0 }).toInt(),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let { url, type, start, end } = req.query;
    url = splitUrl(url);
    if (end <= start) {
      return res.status(400).json({ errors: "illegal data slide" });
    }
    const sortData = await sortDependents({ url, type, start, end });
    res.send(sortData);
  }
);

router.get(
  "/amout",
  query("url").isURL(),
  query("ms").isInt({ min: 0 }),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let { url, ms } = req.query;
    url = splitUrl(url);
    const projectTime = await getProjectTime(url, ms);
    res.send(projectTime);
  }
);

router.post(
  "/fetch",
  body("url").isURL(),
  body("ms").isInt({ min: 0 }),
  body("page").isInt({ min: -1 }),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let { url, ms, page, minutes } = req.body;
    url = splitUrl(url);
    if (state.isfetching == false) {
      state.onFetch();
      state.onStart();
      res.send({
        messgae: `sever is crawl with url : ${url}`,
      });
      await fetchMutipleData(url, ms, page, minutes);
      state.onUnFetch();
    } else {
      res.status(503).json({
        isfetching: true,
        messgae: "server is in another process fetching data",
      });
    }
  }
);

router.get("/state", function (req, res) {
  res.send({
    state: {
      isfetching: state.isfetching,
    },
  });
});
router.post("/stop", function (req, res) {
  if (state.loop) {
    state.onStop();
    res.send({
      messgae: "stop success",
      loop: state.loop,
    });
  } else {
    res.send({
      message: "not have loop to stop",
      loop: state.loop,
    });
  }
});

module.exports = router;
