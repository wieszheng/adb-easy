import { create } from "zustand";
import log from "@/lib/log";

interface DeviceState {
  deviceInfo: any;
  devices: any[];
  loading: boolean;
  currentDevice: string | null;
  setDeviceInfo: (info: any | null) => void;
  fetchDeviceInfo: (deviceId: string) => Promise<void>;
  fetchDevices: () => Promise<void>;
  setCurrentDevice: (deviceId: string) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  deviceInfo: null,
  devices: [],
  loading: false,
  currentDevice: null,
  setDeviceInfo: (info) => set({ deviceInfo: info }),
  setCurrentDevice: (deviceId) => set({ currentDevice: deviceId }),
  fetchDeviceInfo: async (deviceId) => {
    const result = await window.main.getOverview(deviceId);
    set({ deviceInfo: result, currentDevice: deviceId });
  },
  fetchDevices: async () => {
    set({ loading: true });
    const result = await window.main.getDevices();
    log.success("getDevices", result);
    set({ devices: result });
    if (result.length > 0) {
      const deviceInfo = await window.main.getOverview(result[0].id);
      log.success("getOverview", deviceInfo);
      set({
        deviceInfo,
        currentDevice: result[0].id,
      });
    }
    set({ loading: false });
  },
}));
