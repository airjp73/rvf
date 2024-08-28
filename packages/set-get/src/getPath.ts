import { stringToPathArray } from "./stringToPathArray";

export const getPath = (object: any, path: string | (string | number)[]) => {
  const parts = Array.isArray(path) ? path : stringToPathArray(path);
  let value = object;
  for (const part of parts) {
    value = (value as any)?.[part];
  }
  return value;
};
