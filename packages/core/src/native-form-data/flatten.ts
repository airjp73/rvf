import { setPath } from "set-get";
import { MultiValueMap } from "./MultiValueMap";

export const objectFromPathEntries = (entries: [string, any][]) => {
  const map = new MultiValueMap<string, any>();
  entries.forEach(([key, value]) => map.add(key, value));
  return [...map.entries()].reduce(
    (acc, [key, value]) =>
      setPath(acc, key, value.length === 1 ? value[0] : value),
    {} as Record<string, any>,
  );
};

export type GenericObject = { [key: string]: any };

export const preprocessFormData = (
  data: GenericObject | FormData,
): GenericObject => {
  // A slightly janky way of determining if the data is a FormData object
  // since node doesn't really have FormData
  if ("entries" in data && typeof data.entries === "function")
    return objectFromPathEntries([...data.entries()]);
  return objectFromPathEntries(Object.entries(data));
};
