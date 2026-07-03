import process from "node:process";
import os from "node:os";
import path from "node:path";
import electron from "electron";
import config from "./config.js";

const {app, shell} = electron;
const appName = app.getName();

const helpSubmenu = [{
  label: `${appName} Website`,
  click() {
    shell.openExternal("https://github.com/hrfmmymt/spinach");
  },
}, {
  label: "Report an Issue...",
  click() {
    const body = `
<!-- Please succinctly describe your issue and steps to reproduce it. -->
-
${app.getName()} ${app.getVersion()}
Electron ${process.versions.electron}
${process.platform} ${process.arch} ${os.release()}`;

    shell.openExternal(`https://github.com/hrfmmymt/spinach/issues/new?body=${encodeURIComponent(body)}`);
  },
}];

if (process.platform !== "darwin") {
  helpSubmenu.push({
    type: "separator",
  }, {
    role: "about",
    click() {
      electron.dialog.showMessageBox({
        title: `About ${appName}`,
        message: `${appName} ${app.getVersion()}`,
        icon: path.join(import.meta.dirname, "static/Icon.png"),
        buttons: [],
      });
    },
  });
}

const darwinTpl = [{
  label: appName,
  submenu: [{
    role: "about",
  }, {
    type: "separator",
    role: "services",
    submenu: [],
  }, {
    type: "separator",
  }, {
    role: "hide",
  }, {
    role: "hideOtherWindows",
  }, {
    role: "unhide",
  }, {
    type: "separator",
  }, {
    role: "quit",
  }],
}, {
  label: "Edit",
  submenu: [{
    role: "undo",
  }, {
    role: "redo",
  }, {
    type: "separator",
  }, {
    role: "cut",
  }, {
    role: "copy",
  }, {
    role: "paste",
  }, {
    role: "pasteAndMatchStyle",
  }, {
    role: "delete",
  }, {
    role: "selectAll",
  }],
}, {
  label: "View",
  submenu: [
    {
      label: "Reload",
      accelerator: "CmdOrCtrl+R",
      click(_item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.reload();
        }
      },
    }, {
      role: "togglefullscreen",
    },
  ],
}, {
  role: "window",
  submenu: [{
    role: "minimize",
  }, {
    role: "close",
  }, {
    type: "separator",
  }, {
    type: "separator",
  }, {
    role: "front",
  }, {
    type: "separator",
  }, {
    type: "checkbox",
    label: "Always on Top",
    accelerator: "Cmd+Shift+T",
    checked: config.get("alwaysOnTop"),
    click(item, focusedWindow) {
      config.set("alwaysOnTop", item.checked);
      focusedWindow.setAlwaysOnTop(item.checked);
    },
  }],
}, {
  role: "help",
  submenu: helpSubmenu,
}];

const otherTpl = [{
  label: "File",
  submenu: [{
    role: "quit",
  }],
}, {
  label: "Edit",
  submenu: [{
    role: "undo",
  }, {
    role: "redo",
  }, {
    type: "separator",
  }, {
    role: "cut",
  }, {
    role: "copy",
  }, {
    role: "paste",
  }, {
    role: "pasteAndMatchStyle",
  }, {
    role: "delete",
  }, {
    type: "separator",
  }, {
    role: "selectAll",
  }],
}, {
  label: "View",
  submenu: [
    {
      label: "Reload",
      accelerator: "CmdOrCtrl+R",
      click(_item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.reload();
        }
      },
    }, {
      role: "togglefullscreen",
    },
  ],
}, {
  role: "help",
  submenu: helpSubmenu,
}];

const tpl = process.platform === "darwin" ? darwinTpl : otherTpl;

export default electron.Menu.buildFromTemplate(tpl);
