// `flatten` is taken from https://github.com/richie5um/FlattenJS. Decided to implement them here instead of using that package because this is a core functionality of the library and this will add more flexibility in case we need to change the implementation.
import assign from "lodash/assign";
import isArray from "lodash/isArray";
import isObject from "lodash/isObject";
import keys from "lodash/keys";
import mapKeys from "lodash/mapKeys";
import set from "lodash/set";
import transform from "lodash/transform";
import { GenericObject } from ".";

export const objectFromPathEntries = (entries: [string, any][]) =>
  entries.reduce((acc, [key, value]) => set(acc, key, value), {});

/** Flatten an object so there are no nested objects or arrays */
export function flatten(obj: GenericObject, preserveEmpty = false) {
  return transform(
    obj,
    function (result: GenericObject, value, key) {
      if (isObject(value)) {
        let flatMap = mapKeys(
          flatten(value, preserveEmpty),
          function (_mvalue, mkey) {
            if (isArray(value)) {
              let index = mkey.indexOf(".");
              if (-1 !== index) {
                return `${key}[${mkey.slice(0, index)}]${mkey.slice(index)}`;
              }
              return `${key}[${mkey}]`;
            }
            return `${key}.${mkey}`;
          }
        );

        assign(result, flatMap);

        // Preverve Empty arrays and objects
        if (preserveEmpty && keys(flatMap).length === 0) {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }

      return result;
    },
    {}
  );
}
