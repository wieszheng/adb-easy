import { ElectronHandler } from "../preload";

declare global {
  interface Window {
    main: ElectronHandler;
    logcat: any;
  }
}

export {};
