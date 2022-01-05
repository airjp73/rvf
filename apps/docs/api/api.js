/**
 * This module will get compiled to './index.js' in this folder
 */
const { createRequestHandler } = require("@remix-run/vercel");

module.exports = createRequestHandler({
  build: require("./_build/index.js"),
});
