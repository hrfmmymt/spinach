const Config = require('electron-config');

module.exports = new Config({
  defaults: {
    zoomFactor: 1,
    lastWindowState: {
      width: 960,
      height: 320
    },
    notifications: 0
  }
});