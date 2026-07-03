import process from "node:process";
import path from "node:path";
import fs from "node:fs";
import electron from "electron";
import debug from "electron-debug";
import electronDl from "electron-dl";
import contextMenu from "electron-context-menu";
import appMenu from "./menu.js";
import config from "./config.js";
import getNotificationCount from "./notification-count.js";

const {app} = electron;

debug({showDevTools: false});
electronDl();
contextMenu();

let mainWindow;
let isQuitting = false;

const gotTheLock = app.requestSingleInstanceLock();

if (gotTheLock) {
  app.on("second-instance", () => {
    if (!mainWindow) {
      return;
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.focus();
  });
} else {
  app.quit();
}

function updateBadge(title) {
  const count = getNotificationCount(title) ?? 0;

  if (process.platform === "darwin" || process.platform === "linux") {
    app.setBadgeCount(count);
    return;
  }

  if (process.platform === "win32" && mainWindow) {
    if (count > 0) {
      const overlayIconPath = path.join(import.meta.dirname, "static/notification-overlay.png");
      const overlayIcon = electron.nativeImage.createFromPath(overlayIconPath);
      mainWindow.setOverlayIcon(overlayIcon, `${count} unread notifications`);
    } else {
      mainWindow.setOverlayIcon(null, "");
    }
  }
}

const isAppUrl = url => {
  try {
    const host = new URL(url).hostname;
    return host.includes("backlog.com")
      || host.includes("backlog.jp")
      || host.includes("nulab.com")
      || host.includes("nulab-inc.com");
  } catch {
    return false;
  }
};

function createMainWindow() {
  const lastWindowState = config.get("lastWindowState");
  const maxWindowInteger = 2_147_483_647;

  const win = new electron.BrowserWindow({
    title: app.getName(),
    show: false,
    x: lastWindowState.x,
    y: lastWindowState.y,
    width: lastWindowState.width,
    height: lastWindowState.height,
    icon:
      process.platform === "linux" && path.join(import.meta.dirname, "static/Icon.png"),
    alwaysOnTop: config.get("alwaysOnTop"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(import.meta.dirname, "browser.js"),
      nodeIntegration: false,
      plugins: true,
    },
  });

  if (process.platform === "darwin") {
    win.setSheetOffset(40);
  }

  win.loadURL(config.get("lastURL") || "https://www.backlog.jp/");

  win.webContents.setWindowOpenHandler(({url}) => {
    if (isAppUrl(url)) {
      win.loadURL(url);
    } else {
      electron.shell.openExternal(url);
    }

    return {action: "deny"};
  });

  win.on("close", event => {
    if (isQuitting) {
      return;
    }

    event.preventDefault();

    if (process.platform === "darwin") {
      app.hide();
    } else {
      win.hide();
    }
  });

  win.on("page-title-updated", (event, title) => {
    event.preventDefault();
    updateBadge(title);
  });

  win.on("enter-full-screen", () => {
    win.setMaximumSize(maxWindowInteger, maxWindowInteger);
  });

  return win;
}

app.on("ready", () => {
  const {defaultSession} = electron.session;

  defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(isAppUrl(webContents.getURL()));
  });

  defaultSession.setPermissionCheckHandler((_webContents, _permission, requestingOrigin) =>
    isAppUrl(requestingOrigin));

  electron.Menu.setApplicationMenu(appMenu);
  mainWindow = createMainWindow();

  const page = mainWindow.webContents;

  page.on("dom-ready", () => {
    page.insertCSS(fs.readFileSync(path.join(import.meta.dirname, "browser.css"), "utf8"));
    mainWindow.show();
  });

  page.on("did-navigate", (_event, url) => {
    const parsed = new URL(url);
    const {hostname} = parsed;
    const isWorkspaceUrl
      = (hostname.endsWith(".backlog.com") || hostname.endsWith(".backlog.jp"))
        && hostname !== "www.backlog.com"
        && hostname !== "www.backlog.jp"
        && hostname !== "backlog.com"
        && hostname !== "backlog.jp";
    if (isWorkspaceUrl) {
      config.set("lastURL", url);
    }
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
