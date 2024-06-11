import { type MDXComponents } from "mdx/types";
import * as allComponents from "./mdx";

const { wrapper, ...rest } = allComponents;

export function useMDXComponents(components: MDXComponents) {
  return {
    ...components,
    ...rest,
  };
}
