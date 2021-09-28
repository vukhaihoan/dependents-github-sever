//@ts-check
const mongoose = require("mongoose");
require("dotenv").config();
async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("connect mongodb success");
}
main().catch((err) => console.log(err));

const { projectModel } = require("./src/mongodb/mongoContructer");

async function find(url) {
  const project = await projectModel.findOne({
    url: url,
  });
  if (project) {
    return project;
  }
  return false;
}

function doi(ints) {
  ints = !ints;
  return ints;
}
async function test(url) {
  let projectInstance = await find(url);
  // console.log(projectInstance.listDependents.length);
  // /**
  //  * @type {Array}
  //  */
  // let arr = projectInstance.listDependents;
  // /**
  //  * @type {Array}
  //  */
  // let newArr = arr.filter((e) => e.stars > 0);
  // console.log(newArr.length);
  // projectInstance.listDependents = newArr;
  console.log(projectInstance.lastpage);
  let ints = doi(projectInstance.lastpage);
  console.log(ints);
  // projectInstance.lastpage = false;
  projectInstance.save(function (err, data) {
    if (err) return console.error(err);
    console.log("success");
  });
}
test("https://github.com/tannerlinsley/react-query");
