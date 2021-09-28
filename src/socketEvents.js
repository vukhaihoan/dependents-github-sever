const { validUrl } = require("./crawl/util");
const { state } = require("./state/index");
module.exports = (io, socket) => {
  setInterval(() => {
    if (state.emitEvent) {
      io.emit("server state", {
        state: {
          isfetching: state.isfetching,
        },
      });
      state.onEmitEventDone();
    }
  }, 500);
};
