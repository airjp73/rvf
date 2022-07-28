import { makeConfig } from "vite-config";

export default makeConfig({
  lib: "remix-validated-form",
  external: ["react", "@remix-run/react"],
  dir: __dirname,
});
