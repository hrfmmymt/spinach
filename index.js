"use strict";

const path = require("path");
const fs = require("fs");
const electron = require("electron");
const appMenu = require("./menu");
const config = require("./config");

const app = electron.app;

require("electron-debug")();
require("electron-dl")();
require("electron-context-menu")();

let mainWindow;
let isQuitting = false;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function updateBadge(title) {
  if (title.indexOf("Backlog") === -1) {
    return;
  }

  let messageCount = title.match(/^\[(.+?)]/);
  messageCount = messageCount ? Number(messageCount[1].replace(/\D/g, "")) : 0;

  if (process.platform === "darwin" || process.platform === "linux") {
    app.setBadgeCount(messageCount);
  }

  if (process.platform === "linux" || process.platform === "win32") {
    tray.setBadge(messageCount);
  }
}

function createMainWindow() {
  const lastWindowState = config.get("lastWindowState");
  const maxWindowInteger = 2147483647;

  const win = new electron.BrowserWindow({
    title: app.getName(),
    show: false,
    x: lastWindowState.x,
    y: lastWindowState.y,
    width: lastWindowState.width,
    height: lastWindowState.height,
    icon:
      process.platform === "linux" && path.join(__dirname, "static/Icon.png"),
    alwaysOnTop: config.get("alwaysOnTop"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "browser.js"),
      nodeIntegration: false,
      plugins: true,
    },
  });

  if (process.platform === "darwin") {
    win.setSheetOffset(40);
  }

  win.loadURL("https://www.backlog.jp/");

  win.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();

      if (process.platform === "darwin") {
        app.hide();
      } else {
        win.hide();
      }
    }
  });

  win.on("page-title-updated", (e, title) => {
    e.preventDefault();
    updateBadge(title);
  });

  win.on("enter-full-screen", () => {
    win.setMaximumSize(maxWindowInteger, maxWindowInteger);
  });

  return win;
}

app.on("ready", () => {
  electron.Menu.setApplicationMenu(appMenu);
  mainWindow = createMainWindow();

  const page = mainWindow.webContents;

  page.on("dom-ready", () => {
    page.insertCSS(
      fs.readFileSync(path.join(__dirname, "browser.css"), "utf8")
    );
    mainWindow.show();
  });

  page.on("new-window", (e, url) => {
    e.preventDefault();
    electron.shell.openExternal(url);
  });
});

app.on("activate", () => {
  mainWindow.show();
});

app.on("before-quit", () => {
  isQuitting = true;

  if (!mainWindow.isFullScreen()) {
    config.set("lastWindowState", mainWindow.getBounds());
  }
});
