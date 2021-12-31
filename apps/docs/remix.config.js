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
      // This package will be missing on the very first yarn install
      // because `custom-remark-plugin` isn't built yet
      import("custom-remark-plugin")
        .then((mod) => mod.default)
        .catch(() => null),
    ]);

    return {
      remarkPlugins: [codeImport].filter(Boolean),
      rehypePlugins: [rehypeHighlight],
    };
  },
};
