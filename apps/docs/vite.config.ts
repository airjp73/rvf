import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import tsconfigPaths from "vite-tsconfig-paths";
import mdx from "@mdx-js/rollup";
import { compile } from "@mdx-js/mdx";
import * as path from "path";

import { rehypePlugins } from "./app/mdx/rehype.mjs";
import { remarkPlugins } from "./app/mdx/remark.mjs";

export default defineConfig(({ isSsrBuild, command }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./server/app.ts",
        }
      : undefined,
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  ssr: {
    noExternal: command === "build" ? true : undefined,
  },
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        providerImportSource: path.resolve(
          path.join(__dirname, "./app/ui/mdx/mdx-components.tsx"),
        ),
        remarkPlugins,
        rehypePlugins: rehypePlugins as any,
      }),
    },
    {
      enforce: "pre",
      name: "code-import",
      async transform(src, id) {
        if (id.endsWith("?code")) {
          const code = await compile(["```tsx", src.trim(), "```"].join("\n"), {
            rehypePlugins: rehypePlugins as any,
            remarkPlugins,
            providerImportSource: path.resolve(
              path.join(__dirname, "./app/ui/mdx/code-components.tsx"),
            ),
          });
          return {
            code: code.toString(),
            map: null,
          };
        }
      },
    },
    reactRouter() as any,
    tsconfigPaths() as any,
  ],
}));
