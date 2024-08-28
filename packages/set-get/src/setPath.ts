import { stringToPathArray } from "./stringToPathArray";

export function setPath<T>(
  object: T,
  path: string | (string | number)[],
  value: unknown,
) {
  // deeply mutate the data
  const parts = Array.isArray(path) ? path : stringToPathArray(path);
  let obj: any = object;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];
    if (obj[part] === undefined) {
      if (typeof nextPart === "number") {
        obj[part] = [];
      } else {
        obj[part] = {};
      }
    }
    obj = obj[part];
  }

  obj[parts[parts.length - 1]] = value;
  return object;
}
