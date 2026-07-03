import Store from "electron-store";

const config = new Store({
  defaults: {
    zoomFactor: 1,
    lastWindowState: {
      width: 800,
      height: 600,
    },
    alwaysOnTop: false,
  },
});

export default config;
