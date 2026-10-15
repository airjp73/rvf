import { stringToPathArray } from "./stringToPathArray";

const REJECT_KEYS = ["__proto__", "constructor", "prototype"];

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

    if (REJECT_KEYS.includes(String(part)))
      throw new Error(`Attempted to set a forbidden key: ${part}`);

    // Use Object.hasOwn to only check own properties.
    // obj[part] === undefined matches inherited properties too,
    // which allows prototype pollution (e.g. hasOwnProperty calls the
    // function from Object.prototype instead of creating a new key).
    if (!Object.hasOwn(obj, part)) {
      if (typeof nextPart === "number") {
        obj[part] = [];
      } else {
        obj[part] = {};
      }
    }
    obj = obj[part];
  }

  const finalKey = parts[parts.length - 1];
  if ((REJECT_KEYS.includes(String(finalKey))))
    throw new Error(`Attempted to set a forbidden key: ${finalKey}`);

  obj[finalKey] = value;

  return object;
}
