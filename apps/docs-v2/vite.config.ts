import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import mdx from "@mdx-js/rollup";
import { compile } from "@mdx-js/mdx";
import * as path from "path";

import { rehypePlugins } from "./app/mdx/rehype.mjs";
import { remarkPlugins } from "./app/mdx/remark.mjs";

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        providerImportSource: path.resolve(
          path.join(__dirname, "./app/ui/mdx/mdx-components.tsx"),
        ),
        remarkPlugins,
        rehypePlugins,
      }),
    },
    {
      enforce: "pre",
      name: "code-import",
      async transform(src, id) {
        if (id.endsWith("?code")) {
          const code = await compile(["```tsx", src.trim(), "```"].join("\n"), {
            rehypePlugins,
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
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
});
