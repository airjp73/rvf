import * as R from "remeda";
import { MultiValueMap } from "./MultiValueMap";

export const objectFromPathEntries = (entries: [string, any][]) => {
  const map = new MultiValueMap<string, any>();
  entries.forEach(([key, value]) => map.add(key, value));
  return [...map.entries()].reduce(
    (acc, [key, value]) =>
      R.set(acc, key, value.length === 1 ? value[0] : value),
    {} as Record<string, any>
  );
};
