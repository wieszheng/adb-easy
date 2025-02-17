import {
  Smartphone,
  Cpu,
  HardDrive,
  Monitor,
  Wifi,
  Globe,
  Network,
  Info,
  Hash,
  SmartphoneIcon as Android,
  Type,
} from "lucide-react";
import { useDeviceStore } from "@/store/useDeviceStore";
import { fileSize } from "@/lib/utils";

export function Overview() {
  const { deviceInfo } = useDeviceStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="flex items-start gap-3">
        <Smartphone className="w-5 h-5 mt-1 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">名称</div>
          <div className="font-medium">{deviceInfo?.name}</div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 mt-1 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">品牌</div>
          <div className="font-medium">{deviceInfo?.brand}</div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Hash className="w-5 h-5 mt-1 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">型号</div>
          <div className="font-medium">{deviceInfo?.model}</div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Hash className="w-5 h-5 mt-1 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">序列号</div>
          <div className="font-medium">{deviceInfo?.serialNum}</div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Android className="w-5 h-5 mt-1 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">Android 版本</div>
          <div className="font-medium">{`Android ${deviceInfo?.androidVersion || "?"} (API ${deviceInfo?.sdkVersion || "?"})`}</div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Cpu className="w-5 h-5 mt-1 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">内核版本</div>
          <div className="font-medium truncate">
            {deviceInfo?.kernelVersion}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Cpu className="w-5 h-5 mt-1 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">处理器</div>
          <div className="font-medium">{deviceInfo?.abi}</div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <HardDrive className="w-5 h-5 mt-1 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">存储</div>
          <div className="font-medium">
            <span className="text-green-600">{`${fileSize((deviceInfo?.storageUsed as number) || 0)} / ${fileSize(
              (deviceInfo?.storageTotal as number) || 0,
            )}`}</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <HardDrive className="w-5 h-5 mt-1 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">内存</div>
          <div className="font-medium">
            {fileSize((deviceInfo?.memTotal as number) || 0)}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Monitor className="w-5 h-5 mt-1 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">物理分辨率</div>
          <div className="font-medium">{`${deviceInfo?.physicalResolution || "?"} (${deviceInfo?.physicalDensity || "?"}dpi)`}</div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Monitor className="w-5 h-5 mt-1 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">分辨率</div>
          <div className="font-medium">{`${deviceInfo?.resolution || "?"} (${deviceInfo?.density || "?"}dpi)`}</div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Wifi className="w-5 h-5 mt-1 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">Wi-Fi</div>
          <div className="font-medium">{deviceInfo?.wifi}</div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Globe className="w-5 h-5 mt-1 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">IP 地址</div>
          <div className="font-medium">{deviceInfo?.ip}</div>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Network className="w-5 h-5 mt-1 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">MAC 地址</div>
          <div className="font-medium">{deviceInfo?.mac}</div>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Type className="w-5 h-5 mt-1 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">字体缩放</div>
          <div className="font-medium">{deviceInfo?.fontScale || "1"}x</div>
        </div>
      </div>
    </div>
  );
}
