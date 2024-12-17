import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    // @ts-expect-error this works, but the types are weird here
    reactRouter(),
    tsconfigPaths(),
  ],
});
