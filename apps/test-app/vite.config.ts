import { defineConfig } from "vite";
import { installGlobals } from "react-router";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [reactRouter(), tsconfigPaths()],
});
