import { pathArrayToString } from "./pathArrayToString";
import { stringToPathArray } from "./stringToPathArray";

export const mergePathStrings = (
  ...paths: (string | number | null | undefined)[]
) => {
  return pathArrayToString(
    paths
      .filter((segment) => segment != null)
      .map(String)
      .flatMap(stringToPathArray)
      .filter((segment) => segment !== ""),
  );
};
