'use strict';

const path = require('path');
const electron = require('electron');
const appMenu = require('./menu');
const config = require('./config');

const app = electron.app;

require('electron-debug')();
require('electron-dl')();
require('electron-context-menu')();

let mainWindow;
let isQuitting = false;

const isAlreadyRunning = app.makeSingleInstance(() => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.show();
  }
});

if (isAlreadyRunning) {
  app.quit();
}

function updateBadge(title) {
  if (title.indexOf('Backlog') === -1) {
    return;
  }

  let messageCount = title.replace(/TASK.*$/, '').replace(/[^\x01-\x7E]/g, function(s){
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  }).replace(/\D/g, '');

  messageCount = messageCount ? Number(messageCount) : 0;

  if (process.platform === 'darwin' || process.platform === 'linux') {
    app.setBadgeCount(messageCount);
  }

  if (process.platform === 'linux' || process.platform === 'win32') {
    tray.setBadge(messageCount);
  }
}

function createMainWindow() {
  const lastWindowState = config.get('lastWindowState');
  const maxWindowInteger = 2147483647;

  const win = new electron.BrowserWindow({
    title: app.getName(),
    show: false,
    x: lastWindowState.x,
    y: lastWindowState.y,
    width: lastWindowState.width,
    height: lastWindowState.height,
    icon: process.platform === 'linux' && path.join(__dirname, 'static/Icon.png'),
    minWidth: 960,
    minHeight: 320,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'browser.js'),
      nodeIntegration: false,
      plugins: true
    }
  });

  if (process.platform === 'darwin') {
    win.setSheetOffset(40);
  }

  win.loadURL('https://www.backlog.jp/');

  win.on('close', e => {
    if (!isQuitting) {
      e.preventDefault();

      if (process.platform === 'darwin') {
        app.hide();
      } else {
        win.hide();
      }
    }
  });

  win.on('page-title-updated', (e, title) => {
    e.preventDefault();
    updateBadge(title);
  });

  win.on('enter-full-screen', () => {
    win.setMaximumSize(maxWindowInteger, maxWindowInteger);
  });

  return win;
}

app.on('ready', () => {
  electron.Menu.setApplicationMenu(appMenu);
  mainWindow = createMainWindow();

  const page = mainWindow.webContents;

  page.on('dom-ready', () => {
    mainWindow.show();
  });

  page.on('new-window', (e, url) => {
    e.preventDefault();
    electron.shell.openExternal(url);
  });

});

app.on('activate', () => {
  mainWindow.show();
});

app.on('before-quit', () => {
  isQuitting = true;

  if (!mainWindow.isFullScreen()) {
    config.set('lastWindowState', mainWindow.getBounds());
  }
});
