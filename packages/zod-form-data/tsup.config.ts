import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  format: ["esm", "cjs"],
  define: {
    "import.meta.vitest": "undefined",
  } as any,
  outExtension({ format }) {
    switch (format) {
      case "esm":
        return { js: ".mjs" };
      case "cjs":
        return { js: ".js" };
      default:
        throw new Error("Unknown format");
    }
  },
});
