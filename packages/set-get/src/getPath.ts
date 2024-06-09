import { stringToPathArray } from "./stringToPathArray";

export const getPath = (object: any, path: string) => {
  const parts = stringToPathArray(path);
  let value = object;
  for (const part of parts) {
    value = (value as any)?.[part];
  }
  return value;
};
