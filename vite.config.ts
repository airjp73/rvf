import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [
      ...configDefaults.exclude,
      "./**/*.config.ts",
      "./**/dist",
      "./**/build",
    ],
    environment: "./vitest.jsdom-environment.ts",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
