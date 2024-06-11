import { type MDXComponents } from "mdx/types";
import { code } from "./mdx";

export function useMDXComponents(components: MDXComponents) {
  return {
    ...components,
    code,
  };
}
