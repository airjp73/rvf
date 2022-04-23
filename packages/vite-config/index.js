const path = require("path");
const { defineConfig } = require("vite");
const dts = require("vite-plugin-dts");

exports.makeConfig = ({ lib, external, dir }) =>
  defineConfig({
    define: {
      "import.meta.vitest": undefined,
    },
    build: {
      lib: {
        entry: path.resolve(dir, "./src/index.ts"),
        name: lib,
        fileName: (format) =>
          `${lib.replace("@", "").replace("/", "__")}.${format}.js`,
        formats: ["cjs", "es", "umd"],
      },
      rollupOptions: { external },
    },
    plugins: [
      dts({
        outputDir: path.join(dir, "./dist/types"),
        entryRoot: path.join(dir, "./src"),
      }),
    ],
  });
