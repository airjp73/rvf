import { stringToPathArray } from "./stringToPathArray";


const REJECT_KEYS = ["__proto__", "constructor", "prototype"];

export function setPath<T>(object: T, path: string, value: any) {
  // deeply mutate the data
  const parts = stringToPathArray(path);
  let obj: any = object;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    const nextPart = parts[i + 1];

    if (typeof part === "string" && REJECT_KEYS.includes(part))
      throw new Error(`Attempted to set a forbidden key: ${part}`);

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
