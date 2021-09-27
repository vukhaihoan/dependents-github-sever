const fetch = require("node-fetch");
const cheerio = require("cheerio");
const { state } = require("../state/index");
const { createSession, axiosInstance } = require("./fetch");
const { delay, dynamicSort, convert } = require("./util");
const { STARS, FORKS } = require("./constants");
const { find } = require("../mongodb/mongoUtil");
const { projectModel } = require("../mongodb/mongoContructer");

function getElement(res) {
  try {
    const dependentsElements = [];
    const $ = cheerio.load(res);
    const els = $(`div.Box > div.Box-row`).toArray();
    let urlBeforeParam;
    const urlPage = $(
      'div.BtnGroup[data-test-selector="pagination"]'
    ).children();
    const urlBefore = urlPage.attr("href");
    if (urlBefore) {
      urlBeforeParam = new URL(urlBefore).search;
    } else {
      urlBeforeParam = null;
    }
    const urlafter = urlPage.last().attr("href");
    const urlAfterParam = new URL(urlafter).search;
    els.map((el) => {
      const user = $('a[data-hovercard-type="user"]', el).text();
      const org = $('a[data-hovercard-type="organization"]', el).text();
      const author = user || org;
      const repo = $('a[data-hovercard-type="repository"]', el).text();
      const repoUrl =
        `https://github.com` +
        $('a[data-hovercard-type="repository"]', el).attr("href");
      const strSF = $("span.color-text-tertiary.text-bold.pl-3", el).text();
      const arrSF = strSF.match(/\d+(?:\,\d+)*/g);
      const [stars, forks] = arrSF.map((x) => Number(x.replace(/\,/g, "")));
      const a = {
        author,
        repo,
        repoUrl,
        stars,
        forks,
      };
      dependentsElements.push(a);
    });
    return { dependentsElements, urlBeforeParam, urlAfterParam };
  } catch (error) {
    console.log(error);
    console.log(res);
  }
}

async function getProjectTime(url, ms) {
  const fullurl = url + `/network/dependents`;
  const res = await fetch(fullurl).then((res) => res.text());
  const $ = cheerio.load(res);
  const amout = $(
    "#dependents > div.Box > div.Box-header.clearfix > div > div > a.btn-link.selected"
  )
    .text()
    .match(/\d+(?:\,\d+)*/g);
  const [amoutNumber] = amout.map((x) => Number(x.replace(/\,/g, "")));
  const projectTime = convert(amoutNumber, ms);
  console.log(projectTime);
  return projectTime;
}

async function fetchData(url, listPage, listDependents) {
  let afterParam = listPage[listPage.length - 1]?.urlAfterParam;
  let fullurl;
  if (afterParam) {
    fullurl = url + "/network/dependents" + afterParam;
  } else {
    fullurl = url + `/network/dependents`;
  }
  // console.log(axiosInstance.defaults);
  const res = await axiosInstance
    .get(fullurl)
    .then((res) => res.data)
    .catch((err) => {
      state.onUnFetch();
      console.log(err);
    });
  const { dependentsElements, urlBeforeParam, urlAfterParam } = getElement(res);
  listPage.push({ page: listPage.length + 1, urlBeforeParam, urlAfterParam });
  listDependents.push(...dependentsElements);
  // console.log(listDependents);
  return { fullurl };
}

async function loop(url, ms, listPage, listDependents, page) {
  for (let i = 0; i < page; i++) {
    let { fullurl } = await fetchData(url, listPage, listDependents);
    console.log(`done with url : ${fullurl}`);
    await delay(ms);
    console.log(`${ms / 1000} s delay done `);
  }
}

async function fetchMutipleData(url, ms, page, minutes) {
  let projectInstance = await find(url);
  if (projectInstance) {
    console.log(true);
  } else {
    console.log(projectInstance);
    projectInstance = new projectModel();
    projectInstance.projectName = url.split("/").last().split("-").join(" ");
    projectInstance.url = url;
    projectInstance.listPage = [];
    projectInstance.listDependents = [];
  }
  await createSession();
  await loop(
    url,
    ms,
    projectInstance.listPage,
    projectInstance.listDependents,
    page
  );
  projectInstance.save(function (err, data) {
    if (err) return console.error(err);
    console.log(data.projectName + " saved to data.");
  });
}

async function sortDependents({ url, type, start, end }) {
  const projectInstance = await find(url);
  const listDependents = projectInstance.listDependents;
  if (type == STARS) {
    listDependents.sort(dynamicSort(STARS));
  }
  if (type == FORKS) {
    listDependents.sort(dynamicSort(FORKS));
  }
  return listDependents.slice(start, end);
}

module.exports = { fetchMutipleData, getProjectTime, sortDependents };

// fetchData("https://github.com/tannerlinsley/react-query", [], []);

// async function testFetch() {
//   await createSession();
//   loop("https://github.com/tannerlinsley/react-query", 0, [], [], 3);
// }

// testFetch();
