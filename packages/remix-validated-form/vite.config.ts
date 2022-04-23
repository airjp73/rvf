import path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  define: {
    "import.meta.vitest": undefined,
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "remix-validated-form",
      fileName: (format) => `remix-validated-form.${format}.js`,
      formats: ["cjs", "es"],
    },
    rollupOptions: {
      external: ["react", "@remix-run/react", "@remix-run/server-runtime"],
    },
  },
  plugins: [
    dts({
      outputDir: "./dist/types",
      entryRoot: "./src",
    }),
  ],
});
