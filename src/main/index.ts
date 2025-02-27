import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { join } from "path";
import {
  clearPackage,
  createDir,
  deleteDir,
  deleteFile,
  deviceShell,
  disablePackage,
  enablePackage,
  getDevices,
  getOverview,
  getPackages,
  installPackage,
  moveFile,
  pullApk,
  pullFile,
  pushFile,
  readDir,
  screenCap,
  startPackage,
  ScreenRecord,
  statFile,
  stopPackage,
  uninstallPackage,
  getFpsByLatency,
  getCpuUsage,
  startLogcat,
  clearLogcat,
  getMemoryUsage,
  getCurrentFlow,
} from "./adb";
import { createTray } from "./tray";

let screenRecordProcess: { kill: () => void } | null = null;

// 添加类型定义
interface LogcatReader {
  reader: any;
  stop: () => void;
}

interface LogcatProcess {
  process: any;
  stop: () => void;
}

interface ExtendedWebContents extends Electron.WebContents {
  logcatReader?: LogcatReader | null;
  logcatProcess?: LogcatProcess | null;
}

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    title: "AdbEasy",
    width: 1280,
    height: 700,
    minWidth: 1280,
    minHeight: 700,
    autoHideMenuBar: false,
    center: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
    },
  });

  mainWindow.loadURL("http://localhost:5173");
  // mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  createTray(mainWindow);
  let willClose = false;
  mainWindow.on("close", (e) => {
    if (willClose) {
      return;
    }
    e.preventDefault();
    mainWindow.hide();
    if (app.dock) {
      app.dock.hide();
    }
  });

  app.on("before-quit", () => {
    willClose = true;
  });

  mainWindow.on("show", () => {
    willClose = false;
  });
  ipcMain.handle("showSaveDialog", async (_, options) => {
    return await dialog.showSaveDialog({ ...options });
  });
  ipcMain.handle("showOpenDialog", async (_, options) => {
    return await dialog.showOpenDialog({ ...options });
  });

  ipcMain.handle("getDevices", getDevices);
  ipcMain.handle("getOverview", async (_, deviceId) => {
    return await getOverview(deviceId);
  });
  ipcMain.handle("getPackages", async (_, deviceId, system) => {
    return await getPackages(deviceId, system);
  });
  ipcMain.handle("stopPackage", async (_, deviceId, pkg) => {
    await stopPackage(deviceId, pkg);
  });
  ipcMain.handle("clearPackage", async (_, deviceId, pkg) => {
    await clearPackage(deviceId, pkg);
  });
  ipcMain.handle("startPackage", async (_, deviceId, pkg) => {
    await startPackage(deviceId, pkg);
  });
  ipcMain.handle("installPackage", async (_, deviceId, apkPath) => {
    await installPackage(deviceId, apkPath);
  });
  ipcMain.handle("uninstallPackage", async (_, deviceId, pkg) => {
    await uninstallPackage(deviceId, pkg);
  });
  ipcMain.handle("disablePackage", async (_, deviceId, pkg) => {
    await disablePackage(deviceId, pkg);
  });
  ipcMain.handle("enablePackage", async (_, deviceId, pkg) => {
    await enablePackage(deviceId, pkg);
  });
  ipcMain.handle("pullApk", async (_, deviceId, pkg, dest) => {
    await pullApk(deviceId, pkg, dest);
  });

  ipcMain.handle("readDir", async (_, deviceId, path) => {
    return await readDir(deviceId, path);
  });
  ipcMain.handle("statFile", async (_, deviceId, path) => {
    return await statFile(deviceId, path);
  });
  ipcMain.handle("pullFile", async (_, deviceId, path, dest) => {
    return await pullFile(deviceId, path, dest);
  });
  ipcMain.handle("pushFile", async (_, deviceId, src, path) => {
    return await pushFile(deviceId, src, path);
  });
  ipcMain.handle("deleteFile", async (_, deviceId, path) => {
    return await deleteFile(deviceId, path);
  });
  ipcMain.handle("deleteDir", async (_, deviceId, path) => {
    return await deleteDir(deviceId, path);
  });
  ipcMain.handle("createDir", async (_, deviceId, path) => {
    return await createDir(deviceId, path);
  });
  ipcMain.handle("moveFile", async (_, deviceId, src, path) => {
    return await moveFile(deviceId, src, path);
  });
  ipcMain.handle("screenCap", async (_, deviceId) => {
    return await screenCap(deviceId);
  });
  ipcMain.handle("deviceShell", async (_, deviceId, cmd) => {
    return await deviceShell(deviceId, cmd);
  });
  ipcMain.handle("startScreenRecord", async (_, deviceId) => {
    if (screenRecordProcess) {
      throw new Error("A recording is already in progress.");
    }

    screenRecordProcess = await ScreenRecord(deviceId);
    return true;
  });
  ipcMain.handle("stopScreenRecord", async () => {
    if (screenRecordProcess) {
      screenRecordProcess.kill();
      screenRecordProcess = null;
    }
    return true;
  });
  ipcMain.handle("getFpsByLatency", async (_, deviceId, pkg) => {
    return await getFpsByLatency(deviceId, pkg);
  });
  ipcMain.handle("getCpuUsage", async (_, deviceId, pkg) => {
    return await getCpuUsage(deviceId, pkg);
  });
  ipcMain.handle("getMemoryUsage", async (_, deviceId, pkg) => {
    return await getMemoryUsage(deviceId, pkg);
  });
  ipcMain.handle("startLogcat", async (event, deviceId) => {
    try {
      (event.sender as ExtendedWebContents).logcatProcess = await startLogcat(
        deviceId,
        (line) => {
          (event.sender as ExtendedWebContents).send("logcatData", line);
        },
      );
      return true;
    } catch (error) {
      console.error("启动日志监听失败:", error);
      return false;
    }
  });

  ipcMain.handle("stopLogcat", (event) => {
    try {
      const sender = event.sender as ExtendedWebContents;
      if (sender.logcatProcess) {
        sender.logcatProcess.stop();
        sender.logcatProcess = null;
      }
      return true;
    } catch (error) {
      console.error("停止日志监听失败:", error);
      return false;
    }
  });

  ipcMain.handle("clearLogcat", async (_, deviceId) => {
    try {
      await clearLogcat(deviceId);
      return true;
    } catch (error) {
      console.error("清除日志失败:", error);
      return false;
    }
  });

  ipcMain.handle(
    "getCurrentFlow",
    async (_, deviceId: string, packageName: string) => {
      return await getCurrentFlow(deviceId, packageName);
    },
  );
});
