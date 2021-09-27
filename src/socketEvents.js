const {
  fetchMutipleData,
  sortDependents,
  getProjectTime,
} = require("./crawl/main");
const { validUrl } = require("./crawl/util");
const { state } = require("./state/index");
module.exports = (io, socket) => {
  const onFetch = async ({ url, ms, page, minutes }) => {
    if (validUrl(url) == false) {
      console.log("false url");
      io.emit("fetch", {
        message: "false url",
        url,
      });
      return;
    }
    if (state.isfetching == false) {
      state.onFetch();
      await fetchMutipleData(url, ms, page, minutes);
      console.log("fetch list done");
      io.emit("fetch", {
        message: "done",
        url,
      });
      state.onUnFetch();
    } else {
      console.log("server busy");
      io.emit("fetch", {
        message: "sever busy",
      });
    }
  };

  const onSeverState = () => {
    io.emit("server state", {
      state: {
        isfetching: state.isfetching,
      },
    });
  };

  const onAmout = async ({ url, ms }) => {
    if (validUrl(url) == false) {
      console.log("false url");
      io.emit("fetch", {
        message: "false url",
        url,
      });
      return;
    }
    await getProjectTime(url, ms);
  };

  const onSort = async ({ url, type, start, end }) => {
    const sortData = await sortDependents({ url, type, start, end });
    io.emit("sort", sortData);
  };

  socket.on("fetch", onFetch);
  socket.on("server state", onSeverState);
  socket.on("amout", onAmout);
  socket.on("sort", onSort);
};
