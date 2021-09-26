const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function range(start, end) {
  return Array(end - start + 1)
    .fill()
    .map((_, idx) => start + idx);
}
// var result = range(9, 18); // [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

function dynamicSort(property) {
  var sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a, b) {
    //   a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0; // small to big
    var result =
      a[property] > b[property] ? -1 : a[property] < b[property] ? 1 : 0;

    return result * sortOrder;
  };
}
// People.sort(dynamicSort("Name"));

function minutesAndSecond(secs) {
  let minutes = Math.floor(secs / 60);
  let seconds = secs - minutes * 60; // secondLeft
  return { minutes, seconds };
}
function secondsToTime(secs) {
  let hours = Math.floor(secs / 3600);
  let secondLeft = secs - hours * 3600;
  let { minutes, seconds } = minutesAndSecond(secondLeft);
  return {
    hours: {
      hours,
      minutes,
      seconds,
    },
    minutes: minutesAndSecond(secs),
    seconds: secs,
  };
}

function convert(amout, ms) {
  if (ms == 0) {
    ms == 1000;
  }
  const page = Math.ceil(amout / 30);
  const secs = (page * ms) / 1000;
  return { time: secondsToTime(secs), page, amout };
}

const validUrl = (s) => {
  try {
    new URL(s);
    return true;
  } catch (err) {
    return false;
  }
};

function checkNullObj(obj) {
  return obj && obj !== "null" && obj !== "undefined";
}

module.exports = {
  delay,
  range,
  dynamicSort,
  convert,
  validUrl,
  checkNullObj,
};
