const { defineConfig } = require("tsup");

exports.config = defineConfig({
  entry: ["src/index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  format: ["esm", "cjs"],
  define: {
    "import.meta.vitest": "undefined",
  },
  outExtension({ format }) {
    return { js: `.${format}.js` };
  },
});
