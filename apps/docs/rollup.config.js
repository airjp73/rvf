import commonJs from "@rollup/plugin-commonjs";
import jsonPlugin from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "api/_build/index.js",
  output: {
    file: "api/_build/index.cjs",
    format: "cjs",
  },
  plugins: [
    commonJs(),
    resolve({
      moduleDirectories: ["node_modules"],
    }),
    jsonPlugin(),
  ],
};
