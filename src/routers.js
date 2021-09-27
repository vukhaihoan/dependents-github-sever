var express = require("express");
var router = express.Router();

const { sortDependents } = require("./crawl/main");

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  next();
});

router.get("/", function (req, res) {
  res.send("oke");
});

router.get("/sort", async function (req, res) {
  console.log(req.body);
  //   const sortData = await sortDependents({ url, type, start, end });
  res.send("oke sort");
});

module.exports = router;
