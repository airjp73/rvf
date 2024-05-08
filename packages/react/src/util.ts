export const prefixedPath = (prefix?: string, path?: string) =>
  [prefix, path].filter(Boolean).join(".");
