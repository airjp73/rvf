import { makeConfig } from "vite-config";

export default makeConfig({
  lib: "@remix-validated-form/with-yup",
  external: ["remix-validated-form", "yup"],
  dir: __dirname,
});
