let state = {
  isfetching: false,
  changeState: function () {
    state.isfetching = !state.isfetching;
  },
  onFetch: function () {
    state.isfetching = true;
  },
  onUnFetch: function () {
    state.isfetching = false;
  },
};

module.exports = { state };
