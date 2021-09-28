const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listPageScheme = new Schema({
  page: Number,
  urlBeforeParam: String || null,
  urlAfterParam: String,
});

const listDependentsSchema = new Schema({
  author: String,
  repo: String,
  repoUrl: String,
  stars: Number,
  forks: Number,
});

const projectSchema = new Schema({
  projectName: String,
  url: String,
  listPage: [listPageScheme],
  listDependents: [listDependentsSchema],
  lastpage: Boolean,
});

const projectModel = mongoose.model("project", projectSchema);

module.exports = { projectModel };
