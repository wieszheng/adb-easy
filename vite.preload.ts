import { defineConfig } from "vite";
import { resolve } from "path";
import { builtinModules } from "node:module";

const builtins = builtinModules.filter((e) => !e.startsWith("_"));
builtins.push("electron", ...builtins.map((m) => `node:${m}`));

export default defineConfig({
  build: {
    outDir: "dist-electron/preload",
    lib: {
      entry: resolve(__dirname, "src/preload/index.ts"),
      name: "Main",
      fileName: "index",
      formats: ["cjs"],
    },
    rollupOptions: {
      external: builtins,
    },
  },
});
