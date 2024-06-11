import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import mdx from "@mdx-js/rollup";
import * as path from "path";

import { recmaPlugins } from "./app/mdx/recma.mjs";
import { rehypePlugins } from "./app/mdx/rehype.mjs";
import { remarkPlugins } from "./app/mdx/remark.mjs";

export default defineConfig({
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        providerImportSource: path.resolve(
          path.join(__dirname, "./app/ui/mdx/mdx-components.tsx")
        ),
        remarkPlugins,
        rehypePlugins,
        recmaPlugins,
      }),
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
