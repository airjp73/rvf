import { makeConfig } from "vite-config";

export default makeConfig({
  lib: "@remix-validated-form/with-zod",
  external: ["remix-validated-form", "zod"],
  dir: __dirname,
});
