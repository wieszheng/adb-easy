import {
  ipcRenderer,
  contextBridge,
  SaveDialogOptions,
  OpenDialogOptions,
} from "electron";

const electronHandler = {
  versions: process.versions,
  getDevices: () => ipcRenderer.invoke("getDevices"),
  getOverview: (deviceId: string) => {
    return ipcRenderer.invoke("getOverview", deviceId);
  },
  getPackages: (deviceId: string, system?: boolean) => {
    return ipcRenderer.invoke("getPackages", deviceId, system);
  },
  stopPackage: (deviceId: string, pkg: string) => {
    return ipcRenderer.invoke("stopPackage", deviceId, pkg);
  },
  clearPackage: (deviceId: string, pkg: string) => {
    return ipcRenderer.invoke("clearPackage", deviceId, pkg);
  },
  startPackage: (deviceId: string, pkg: string) => {
    return ipcRenderer.invoke("startPackage", deviceId, pkg);
  },
  installPackage: (deviceId: string, apkPath: string) => {
    return ipcRenderer.invoke("installPackage", deviceId, apkPath);
  },
  uninstallPackage: (deviceId: string, pkg: string) => {
    return ipcRenderer.invoke("uninstallPackage", deviceId, pkg);
  },
  disablePackage: (deviceId: string, pkg: string) => {
    return ipcRenderer.invoke("disablePackage", deviceId, pkg);
  },
  enablePackage: (deviceId: string, pkg: string) => {
    return ipcRenderer.invoke("enablePackage", deviceId, pkg);
  },
  pullApk: (deviceId: string, pkg: string, dest: string) => {
    return ipcRenderer.invoke("pullApk", deviceId, pkg, dest);
  },

  // dialog
  showSaveDialog: (options: SaveDialogOptions = {}) => {
    return ipcRenderer.invoke("showSaveDialog", options);
  },
  showOpenDialog: (options: OpenDialogOptions = {}) => {
    return ipcRenderer.invoke("showOpenDialog", options);
  },

  readDir: (deviceId: string, path: string) => {
    return ipcRenderer.invoke("readDir", deviceId, path);
  },
  statFile: (deviceId: string, path: string) => {
    return ipcRenderer.invoke("statFile", deviceId, path);
  },
  pullFile: (deviceId: string, path: string, dest: string) => {
    return ipcRenderer.invoke("pullFile", deviceId, path, dest);
  },
  pushFile: (deviceId: string, src: string, dest: string) => {
    return ipcRenderer.invoke("pushFile", deviceId, src, dest);
  },
  deleteFile: (deviceId: string, path: string) => {
    return ipcRenderer.invoke("deleteFile", deviceId, path);
  },
  deleteDir: (deviceId: string, path: string) => {
    return ipcRenderer.invoke("deleteDir", deviceId, path);
  },
  createDir: (deviceId: string, path: string) => {
    return ipcRenderer.invoke("createDir", deviceId, path);
  },
  moveFile: (deviceId: string, src: string, dest: string) => {
    return ipcRenderer.invoke("moveFile", deviceId, src, dest);
  },
  screenCap: (deviceId: string) => {
    return ipcRenderer.invoke("screenCap", deviceId);
  },
  deviceShell: (deviceId: string, cmd: string) => {
    return ipcRenderer.invoke("deviceShell", deviceId, cmd);
  },
  startScreenRecord: (deviceId: string) => {
    return ipcRenderer.invoke("startScreenRecord", deviceId);
  },
  stopScreenRecord: () => ipcRenderer.invoke("stopScreenRecord"),
  getFpsByLatency: (deviceId: string, pkg: string) => {
    return ipcRenderer.invoke("getFpsByLatency", deviceId, pkg);
  },
  getCpuUsage: (deviceId: string, pkg: string) => {
    return ipcRenderer.invoke("getCpuUsage", deviceId, pkg);
  },
  getLogcat: (deviceId: string) => {
    return ipcRenderer.invoke("getLogcat", deviceId);
  },
};

contextBridge.exposeInMainWorld("main", electronHandler);

contextBridge.exposeInMainWorld("logcat", {
  start: (deviceId: string) => ipcRenderer.invoke("startLogcat", deviceId),

  stop: () => ipcRenderer.invoke("stopLogcat"),

  clear: (deviceId: string) => ipcRenderer.invoke("clearLogcat", deviceId),

  onData: (callback: (line: string) => void) => {
    const listener = (_event: any, line: string) => callback(line);
    ipcRenderer.on("logcatData", listener);
    return () => {
      ipcRenderer.removeListener("logcatData", listener);
    };
  },
});

export type ElectronHandler = typeof electronHandler;
