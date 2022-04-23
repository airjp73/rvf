import { makeConfig } from "vite-config";

export default makeConfig({
  lib: "zod-form-data",
  external: ["zod"],
  dir: __dirname,
});
