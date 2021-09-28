let state = {
  isfetching: false,
  emitEvent: false,
  changeState: function () {
    state.isfetching = !state.isfetching;
    state.preState = !state.isfetching;
  },
  onFetch: function () {
    state.isfetching = true;
    state.emitEvent = true;
  },
  onUnFetch: function () {
    state.isfetching = false;
    state.emitEvent = true;
  },
  onEmitEventDone: function () {
    state.emitEvent = false;
  },
};

module.exports = { state };
