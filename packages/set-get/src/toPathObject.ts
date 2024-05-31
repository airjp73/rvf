import { GenericObject } from "@rvf/core";
import { pathArrayToString } from "./pathArrayToString";

export const toPathObject = (obj: GenericObject): Record<string, unknown> => {
  const entries = getLeafEntries(obj, []);
  const flatEntries = entries.map(
    ([path, value]) => [pathArrayToString(path), value] as const,
  );
  return Object.fromEntries(flatEntries);
};

type PathArray = (string | number)[];

const getLeafEntries = (
  obj: unknown,
  prefix: PathArray,
): Array<[PathArray, unknown]> => {
  if (obj == null || typeof obj !== "object") return [[prefix, obj]];
  if (Array.isArray(obj))
    return obj.flatMap((item, index) =>
      getLeafEntries(item, [...prefix, index]),
    );
  return Object.entries(obj).flatMap(([key, value]) =>
    getLeafEntries(value, [...prefix, key]),
  );
};
