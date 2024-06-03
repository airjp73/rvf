import { defineConfig } from "vite";
import { installGlobals } from "@remix-run/node";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [remix(), tsconfigPaths()],
});
