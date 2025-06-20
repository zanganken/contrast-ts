import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "culori/css"],
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  treeshake: "recommended",
});
