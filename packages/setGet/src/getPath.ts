import * as R from "remeda";
import { stringToPathArray } from "./stringToPathArray";

// pathOr types don't support deeper than 3 levels, but the code works
export const getPath = (object: any, path: string) =>
  R.pathOr(object, stringToPathArray(path) as any, undefined);
