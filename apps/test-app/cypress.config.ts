import { defineConfig } from "cypress";
import plugins from "./cypress/plugins";

const port = process.env.PORT ?? "3000";

export default defineConfig({
  chromeWebSecurity: false,

  e2e: {
    chromeWebSecurity: false,
    baseUrl: `http://localhost:${port}`,
    viewportWidth: 1030,
    viewportHeight: 800,
    specPattern: "./cypress/integration/**/*.ts",
    supportFile: "./cypress/support/index.ts",
    video: !process.env.CI,
    screenshotOnRunFailure: !process.env.CI,
    setupNodeEvents(on, config) {
      plugins(on, config);
    },
  },
});
