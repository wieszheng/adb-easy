import Adb, { Client, Device } from "@devicefarmer/adbkit";
import androidDeviceList from "android-device-list";
import * as fs from "node:fs";
import * as path from "node:path";
import { spawn } from "node:child_process";

const client: Client = Adb.createClient({});

export async function getDevices() {
  let devices = await client.listDevices();
  devices = devices.filter((device: Device) => device.type !== "offline");
  return Promise.all(
    devices.map(async (device: Device) => {
      const properties = await client.getDevice(device.id).getProperties();

      let name = `${properties["ro.product.manufacturer"]} ${properties["ro.product.model"]}`;
      const marketName = getMarketName(properties);
      if (marketName) {
        name = marketName;
      }

      return {
        id: device.id,
        name,
        androidVersion: properties["ro.build.version.release"],
        sdkVersion: properties["ro.build.version.sdk"],
      };
    }),
  ).catch(() => []);
}

function getMarketName(properties: any) {
  const keys: any[] = [
    "ro.oppo.market.name",
    "ro.config.marketing_name",
    "ro.vendor.oplus.market.enname",
    "ro.vivo.market.name",
    "ro.product.marketname",
    "ro.asus.product.mkt_name",
  ];

  for (const key of keys) {
    if (properties[key]) {
      return properties[key];
    }
  }

  const device = properties["ro.product.device"];
  const model = properties["ro.product.model"];

  let marketName = "";
  const devices: any[] = androidDeviceList.getDevicesByDeviceId(device);
  if (devices.length === 0) {
    return marketName;
  }

  const deviceFilter = devices.filter((d) => d.model === model);
  if (deviceFilter.length === 0) {
    marketName = devices[0].name;
  } else {
    marketName = deviceFilter[0].name;
  }

  return marketName;
}

export async function getOverview(deviceId: string) {
  const device = client.getDevice(deviceId);
  const properties = await device.getProperties();
  // const cpus = await getCpus(deviceId);

  const kernelVersion: string = (
    await Adb.util.readAll(await device.shell("uname -r"))
  ).toString();

  const fontScale: string = (
    await Adb.util.readAll(await device.shell("settings get system font_scale"))
  ).toString();

  const wifi: string = (
    await Adb.util.readAll(await device.shell("dumpsys wifi"))
  ).toString();

  let ssidMatch = wifi.match(/mWifiInfo\s+SSID: "?(.+?)"?,/);
  if (ssidMatch && ssidMatch[1] === "<unknown ssid>") {
    ssidMatch = null;
  }
  let ip = "";
  let mac = "";

  const wlan0: string = (
    await Adb.util.readAll(await device.shell("ip addr show wlan0"))
  ).toString();
  const ipMatch = wlan0.match(/inet (\d+\.\d+\.\d+\.\d+)/);
  if (ipMatch) {
    ip = ipMatch[1];
  }
  const macMatch = wlan0.match(
    /link\/ether (([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2}))/,
  );
  if (macMatch) {
    mac = macMatch[1];
  }

  return {
    name: getMarketName(properties) || properties["ro.product.name"],
    processor: properties["ro.product.board"] || "",
    abi: properties["ro.product.cpu.abi"],
    brand: properties["ro.product.brand"],
    model: properties["ro.product.model"],
    serialNum: properties["ro.serialno"] || "",
    // cpuNum: cpus.length,
    androidVersion: properties["ro.build.version.release"],
    sdkVersion: properties["ro.build.version.sdk"],
    kernelVersion,
    fontScale: fontScale === "null" ? 0 : parseFloat(fontScale),
    wifi: ssidMatch ? ssidMatch[1] : "",
    ip,
    mac,
    ...(await getStorage(deviceId)),
    ...(await getMemory(deviceId)),
    ...(await getScreen(deviceId)),
  };
}

function getPropValue(key: string, str: string) {
  const lines = str.split("\n");
  for (let i = 0, len = lines.length; i < len; i++) {
    const line = lines[i].trim();
    if (line.startsWith(key)) {
      return line.replace(/.*:/, "").trim();
    }
  }

  return "";
}

async function getScreen(deviceId: string) {
  const wmSize: string = (
    await Adb.util.readAll(await client.getDevice(deviceId).shell("wm size"))
  ).toString();
  const wmDensity: string = (
    await Adb.util.readAll(await client.getDevice(deviceId).shell("wm density"))
  ).toString();
  const physicalResolution = getPropValue("Physical size", wmSize);
  const physicalDensity = getPropValue("Physical density", wmDensity);

  const hasOverrideResolution = wmSize.includes("Override");
  const hasOverrideDensity = wmDensity.includes("Override");
  const resolution = hasOverrideResolution
    ? getPropValue("Override size", wmSize)
    : physicalResolution;
  const density = hasOverrideDensity
    ? getPropValue("Override density", wmDensity)
    : physicalDensity;

  return {
    resolution,
    physicalResolution,
    density,
    physicalDensity,
  };
}

async function getMemory(deviceId: string) {
  const memInfo: string = (
    await Adb.util.readAll(
      await client.getDevice(deviceId).shell("cat /proc/meminfo"),
    )
  ).toString();
  let memTotal = 0;
  let memFree = 0;

  const totalMatch = getPropValue("MemTotal", memInfo);
  let freeMatch = getPropValue("MemAvailable", memInfo);
  if (!freeMatch) {
    freeMatch = getPropValue("MemFree", memInfo);
  }
  if (totalMatch && freeMatch) {
    memTotal = parseInt(totalMatch, 10) * 1024;
    memFree = parseInt(freeMatch, 10) * 1024;
  }

  return {
    memTotal,
    memUsed: memTotal - memFree,
  };
}

async function getStorage(deviceId: string) {
  const storageInfo: string = (
    await Adb.util.readAll(
      await client.getDevice(deviceId).shell("dumpsys diskstats"),
    )
  ).toString();
  let storageTotal = 0;
  let storageFree = 0;

  const match = storageInfo.match(new RegExp("Data-Free: (\\d+)K / (\\d+)K"));
  if (match) {
    storageFree = parseInt(match[1], 10) * 1024;
    storageTotal = parseInt(match[2], 10) * 1024;
  }

  return {
    storageTotal,
    storageUsed: storageTotal - storageFree,
  };
}

export async function getPackages(deviceId: string, system = true) {
  const result: string = (
    await Adb.util.readAll(
      await client
        .getDevice(deviceId)
        .shell(`pm list packages${system ? "" : " -3"}`),
    )
  ).toString();

  return result
    .trim()
    .split("\n")
    .map((line) => line.slice(8));
}

export async function stopPackage(deviceId: string, pkg: string) {
  await Adb.util.readAll(
    await client.getDevice(deviceId).shell(`am force-stop ${pkg}`),
  );
}

export async function clearPackage(deviceId: string, pkg: string) {
  const device = client.getDevice(deviceId);
  await device.clear(pkg);
}

export async function startPackage(deviceId: string, pkg: string) {
  const component = await getMainComponent(deviceId, pkg);
  const device = client.getDevice(deviceId);
  await device.startActivity({
    component,
  });
}

export async function installPackage(deviceId: string, apkPath: string) {
  const device = client.getDevice(deviceId);
  await device.install(apkPath);
}

export async function uninstallPackage(deviceId: string, pkg: string) {
  const device = client.getDevice(deviceId);
  await device.uninstall(pkg);
}

export async function disablePackage(deviceId: string, pkg: string) {
  await Adb.util.readAll(
    await client.getDevice(deviceId).shell(`pm disable-user ${pkg}`),
  );
}

export async function enablePackage(deviceId: string, pkg: string) {
  await Adb.util.readAll(
    await client.getDevice(deviceId).shell(`pm enable ${pkg}`),
  );
}

async function getMainComponent(deviceId: string, pkg: string) {
  const result: string = (
    await Adb.util.readAll(
      await client
        .getDevice(deviceId)
        .shell(`dumpsys package ${pkg} | grep -A 1 MAIN`),
    )
  ).toString();
  const lines = result.split("\n");
  for (let i = 0, len = lines.length; i < len; i++) {
    const line = lines[i].trim();
    if (line.includes(`${pkg}/`)) {
      return line.substring(line.indexOf(`${pkg}/`), line.indexOf(" filter"));
    }
  }
}

export async function pullFile(deviceId: string, path: string, dest: string) {
  const device = client.getDevice(deviceId);
  const transfer = await device.pull(path);
  return new Promise((resolve, reject) => {
    try {
      const writable = fs.createWriteStream(dest);
      writable.on("finish", () => resolve(null));
      transfer.on("error", reject);
      transfer.pipe(writable);
    } catch (err) {
      reject(err);
    }
  });
}

export async function pullApk(deviceId: string, pkg: string, dest: string) {
  const result: string = (
    await Adb.util.readAll(
      await client.getDevice(deviceId).shell(`pm path ${pkg}`),
    )
  ).toString();
  const path = result.trim().split(":").slice(-1)[0];
  return await pullFile(deviceId, path, dest);
}

export async function readDir(deviceId: string, path: string) {
  const device = client.getDevice(deviceId);
  const files: any[] = await device.readdir(path);

  const ret: any[] = [];
  for (let i = 0, len = files.length; i < len; i++) {
    const file = files[i];

    const item: any = {
      name: file.name,
      directory: !file.isFile(),
      mtime: new Date(file.mtimeMs),
      mode: file.mode,
    };

    if (!item.directory) {
      item.size = file.size;
    }

    ret.push(item);
  }
  return ret;
}

export async function statFile(deviceId: string, path: string) {
  const device = client.getDevice(deviceId);
  const stat = await device.stat(path);

  return {
    size: stat.size,
    mtime: new Date(stat.mtimeMs),
    directory: !stat.isFile(),
  };
}

export async function deleteFile(deviceId: string, path: string) {
  await client.getDevice(deviceId).shell(`rm "${path}"`).then(Adb.util.readAll);
}

export async function deleteDir(deviceId: string, path: string) {
  await client
    .getDevice(deviceId)
    .shell(`rm -rf "${path}"`)
    .then(Adb.util.readAll);
}

export async function createDir(deviceId: string, path: string) {
  await client
    .getDevice(deviceId)
    .shell(`mkdir -p "${path}"`)
    .then(Adb.util.readAll);
}

export async function pushFile(deviceId: string, src: string, dest: string) {
  const device = client.getDevice(deviceId);
  const transfer = await device.push(src, dest + path.basename(src));

  return new Promise((resolve, reject) => {
    transfer.on("end", () => resolve(null));
    transfer.on("error", reject);
  });
}

export async function moveFile(deviceId: string, src: string, dest: string) {
  await client
    .getDevice(deviceId)
    .shell(`mv "${src}" "${dest}"`)
    .then(Adb.util.readAll);
}

export async function screenCap(deviceId: string) {
  const buf: string = (
    await Adb.util.readAll(await client.getDevice(deviceId).screencap())
  ).toString("base64");
  return buf;
}

export async function deviceShell(deviceId: string, command: string) {
  const result = await client
    .getDevice(deviceId)
    .shell(command)
    .then(Adb.util.readAll);
  return result.toString();
}

export async function ScreenRecord(deviceId: string) {
  console.log("startScreenRecord");
  const timestamp = new Date().getTime();
  const fileName = `screenrecord-${timestamp}.mp4`;
  const filePath = `/sdcard/screenTemp/${fileName}`;

  await createDir(deviceId, "/sdcard/screenTemp");
  const screenRecordProcess = spawn("adb", [
    "-s",
    deviceId,
    "shell",
    "screenrecord --bugreport --bit-rate 6000000 --time-limit 180",
    filePath,
  ]);

  screenRecordProcess.stdout.on("data", (data: any) => {
    console.log(`stdout: ${data}`);
  });

  screenRecordProcess.stderr.on("data", (data: any) => {
    console.error(`stderr: ${data}`);
  });

  screenRecordProcess.on("close", (code: any) => {
    console.log(`screenrecord process exited with code ${code}`);
  });

  screenRecordProcess.on("error", (error: any) => {
    console.error(`screenrecord process error: ${error}`);
  });
  return {
    process: screenRecordProcess,
    kill: () => {
      screenRecordProcess.kill();
      console.log(`Killed process`);
    },
  };
}

export async function getFpsByLatency(deviceId: string, pkg: string) {
  const fps = 0;

  if (!pkg) {
    return fps;
  }

  const list = await deviceShell(deviceId, "dumpsys SurfaceFlinger --list");
  const layers = list.split("\n").filter((line) => line.includes(pkg));
  if (layers.length === 0) {
    return fps;
  }

  const latencyPromises = layers.map(async (layer) => {
    return await deviceShell(
      deviceId,
      `dumpsys SurfaceFlinger --latency "${layer}"`,
    );
  });

  const latencies = await Promise.all(latencyPromises);

  const allFps = latencies.map((latency) => {
    latency = latency.trim();
    let fps = 0;
    const timestamps: number[] = [];

    latency.split("\n").forEach((line) => {
      const match = line.match(/(\d+)\s+(\d+)\s+(\d+)/);
      if (match) {
        timestamps.push(Number(match[2]) / 1e9);
      }
    });

    timestamps.pop();

    if (timestamps.length > 1) {
      const seconds = timestamps[timestamps.length - 1] - timestamps[0];
      if (seconds > 0) {
        fps = Math.round((timestamps.length - 1) / seconds);
      }
    }

    return fps;
  });
  return Math.max(...allFps);
}

export async function getCpuUsage(deviceId: string, pkg: string) {
  const pid = await deviceShell(deviceId, `pidof ${pkg}`);
  if (!pid) {
    return 0;
  }
  const trimmedPid = pid.trim();
  const result = await deviceShell(
    deviceId,
    `top -n 1 -p ${trimmedPid} -o %CPU -b -q`,
  );
  if (!result) {
    return 0;
  }
  return parseFloat(result.trim());
}

interface MemData {
  [key: string]: number;
}

const MEM_DATA_TEMPLATE: MemData = {
  "Java Heap": 0,
  "Native Heap": 0,
  Code: 0,
  Stack: 0,
  Graphics: 0,
  "Private Other": 0,
  System: 0,
  "TOTAL PSS": 0,
};

export async function getMemoryUsage(deviceId: string, pkg: string) {
  const result = await deviceShell(
    deviceId,
    `dumpsys meminfo --local -s --package ${pkg}`,
  );
  if (result.startsWith("No Process")) {
    return null;
  }
  const memMap: { [processName: string]: MemData } = {};
  let processName = "";

  for (const line of result.split("\n")) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("** MEMINFO")) {
      const match = trimmedLine.match(/\[(.*)\]/);
      if (match) {
        processName = match[1];
        memMap[processName] = { ...MEM_DATA_TEMPLATE };
      }
    } else {
      const lineData = trimmedLine.split(":");
      try {
        for (const key in MEM_DATA_TEMPLATE) {
          if (trimmedLine.startsWith(key) && key !== "TOTAL PSS") {
            const data = lineData[1].split();
            memMap[processName][key] =
              Math.round((parseInt(data[0], 10) / 1024) * 10) / 10;
            break;
          }
        }
      } catch (e) {
        console.error(`解析内存数据失败: ${trimmedLine}`);
        console.error(`错误信息: ${e.message}`);
      }
    }
  }
  for (const name in memMap) {
    if (Object.prototype.hasOwnProperty.call(memMap, name)) {
      let sum = 0;
      for (const key in memMap[name]) {
        if (
          Object.prototype.hasOwnProperty.call(memMap[name], key) &&
          key !== "TOTAL PSS"
        ) {
          sum += memMap[name][key];
        }
      }
      memMap[name]["TOTAL PSS"] = Math.round(sum * 10) / 10;
    }
  }
  return memMap || null;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  tag: string;
  pid: string;
  tid: string;
  message: string;
}

function parseLogLine(line: string, index: number): LogEntry | null {
  const match = line.match(
    /^(\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d{3})\s+(\d+)\s+(\d+)\s+([VDIWE])\s+([^:]+):\s+(.+)$/,
  );

  if (match) {
    const [, timestamp, pid, tid, priority, tag, message] = match;
    const level =
      priority === "V" || priority === "D"
        ? "DEBUG"
        : priority === "I"
          ? "INFO"
          : priority === "W"
            ? "WARNING"
            : "ERROR";

    return {
      id: `${Date.now()}-${index}`,
      timestamp,
      level,
      tag,
      pid,
      tid,
      message,
    };
  }
  return null;
}

export async function startLogcat(
  deviceId: string,
  callback: (entry: LogEntry | null) => void,
) {
  const process = spawn("adb", ["-s", deviceId, "logcat"]);
  let index = 0;

  process.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");
    lines.forEach((line) => {
      if (line.trim()) {
        const logEntry = parseLogLine(line.trim(), index++);
        callback(logEntry);
      }
    });
  });

  process.stderr.on("data", (data) => {
    console.error(`Logcat Error: ${data}`);
  });

  return {
    process,
    stop: () => {
      process.kill();
      console.info("Logcat Info: kill");
    },
  };
}

export async function clearLogcat(deviceId: string) {
  return new Promise<void>((resolve, reject) => {
    const process = spawn("adb", ["-s", deviceId, "logcat", "-c"]);

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Failed to clear logcat, exit code: ${code}`));
      }
    });

    process.on("error", reject);
  });
}

export async function getNetworkTraffic(device: string, packageName: string) {
  try {
    // 首先获取应用的 UID
    const uidCmd = await deviceShell(
      device,
      `dumpsys package ${packageName} | grep userId=`
    );
    const uidMatch = uidCmd.match(/userId=(\d+)/);
    if (!uidMatch) {
      console.error("无法获取应用 UID");
      return { rx: 0, tx: 0 };
    }
    const uid = uidMatch[1];

    // 使用 dumpsys netstats 命令获取流量数据
    const result = await deviceShell(
      device,
      `dumpsys netstats | grep -E "uid ${uid}|rb.*tx.*bytes"`
    );

    let rx = 0;
    let tx = 0;

    // 解析流量数据
    const lines = result.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes(`uid ${uid}`)) {
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && nextLine.includes('rb')) {
          const matches = nextLine.match(/rb=(\d+) rp=\d+ tb=(\d+)/);
          if (matches) {
            rx += parseInt(matches[1], 10);
            tx += parseInt(matches[2], 10);
          }
        }
      }
    }

    return {
      rx: Math.round((rx / 1024) * 100) / 100, // 转换为 KB 并保留两位小数
      tx: Math.round((tx / 1024) * 100) / 100,
    };
  } catch (error) {
    console.error("获取流量数据失败:", error);
    return { rx: 0, tx: 0 };
  }
}
