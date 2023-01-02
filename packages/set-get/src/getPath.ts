import get from "lodash.get";

export const getPath = (object: any, path: string) => {
  return get(object, path);
};
