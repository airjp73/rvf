/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  publicPath: "/build/",
  serverBuildDirectory: "api/_build",
  ignoredRouteFiles: [".*"],
  mdx: async (filename) => {
    const [rehypeHighlight, codeImport] = await Promise.all([
      import("rehype-highlight").then((mod) => mod.default),
      import("custom-remark-plugin").then((mod) => mod.default),
    ]);

    return {
      remarkPlugins: [codeImport],
      rehypePlugins: [rehypeHighlight],
    };
  },
};
