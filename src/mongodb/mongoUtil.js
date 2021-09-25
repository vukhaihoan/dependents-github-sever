const mongoose = require("mongoose");

const { projectModel } = require("./mongoContructer");

async function find(url) {
  const project = await projectModel.findOne({
    url: url,
  });
  if (project) {
    return project;
  }
  return false;
}

module.exports = { find };
