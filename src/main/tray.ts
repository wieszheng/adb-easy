import { BrowserWindow, Menu, Tray, app } from "electron";
import * as path from "path";

export function createTray(mainWindow: BrowserWindow) {
  const tray = new Tray(
    path.join(
      __dirname,
      "../renderer",
      process.platform === "darwin" ? "trayIconTemplate.png" : "trayIcon.png",
    ),
  );

  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "显示",
        click: () => {
          mainWindow.show();
          if (app.dock) {
            app.dock.show();
          }
        },
      },
      {
        label: "退出",
        click: () => app.quit(),
      },
    ]),
  );
}
