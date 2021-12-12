// `flatten` and `unflatten` are taken from https://github.com/richie5um/FlattenJS. Decided to implement them here instead of using that package because this is a core functionality of the library and this will add more flexibility in case we need to change the implementation.

import {
  assign,
  isArray,
  isObject,
  keys,
  mapKeys,
  reduce,
  set,
  transform,
} from "lodash";
import { GenericObject } from ".";

/** Unflatten a previously flatten object */
export function unflatten(params: GenericObject) {
  return reduce(
    params,
    function (result, value, key) {
      return set(result, key, value);
    },
    {}
  );
}

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
