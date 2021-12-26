import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.js",
  output: {
    file: "dist/index.js",
    format: "cjs",
    exports: "default",
  },
  plugins: [resolve()],
};
