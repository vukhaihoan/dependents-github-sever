var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");

const {
  sortDependents,
  getProjectTime,
  fetchMutipleData,
} = require("./crawl/main");
const { state } = require("./state/index");

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
  body("url").isURL(),
  body("type").isString().trim(),
  body("start").isInt({ min: 0 }),
  body("end").isInt({ min: 0 }),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { url, type, start, end } = req.body;
    if (end <= start) {
      return res.status(400).json({ errors: "illegal data slide" });
    }
    const sortData = await sortDependents({ url, type, start, end });
    res.send(sortData);
  }
);

router.get(
  "/amout",
  body("url").isURL(),
  body("ms").isInt({ min: 0 }),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { url, ms } = req.body;
    const projectTime = await getProjectTime(url, ms);
    res.send(projectTime);
  }
);

router.post(
  "/fetch",
  body("url").isURL(),
  body("ms").isInt({ min: 0 }),
  body("page").isInt({ min: 0 }),
  async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { url, ms, page, minutes } = req.body;
    if (state.isfetching == false) {
      state.onFetch();
      await fetchMutipleData(url, ms, page, minutes);
      state.onUnFetch();
      res.send({
        isfetching: false,
        messgae: "fetch list dependents done",
      });
    } else {
      res.status(503).json({
        isfetching: true,
        messgae: "server is in another process fetching data",
      });
    }
  }
);

module.exports = router;
