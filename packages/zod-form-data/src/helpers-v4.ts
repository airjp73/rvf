import { setPath } from "@rvf/set-get";
import * as core from "@zod/core";

type FormDataLikeInput = {
  [Symbol.iterator](): IterableIterator<[string, FormDataEntryValue]>;
  entries(): IterableIterator<[string, FormDataEntryValue]>;
};

const preprocessFormData = (formData: any): Record<string, unknown> => {
  // We're avoiding using `instanceof` here because different environments
  // won't necessarily have `FormData` or `URLSearchParams`
  if (!(Symbol.iterator in formData)) return formData;
  const entries = [...formData];
  const isEntryList = entries.every(
    (item) =>
      Array.isArray(item) && item.length === 2 && typeof item[0] === "string",
  );
  if (!isEntryList) return formData;

  const map: Map<string, unknown[]> = new Map();
  for (const [key, value] of entries) {
    if (map.has(key)) {
      map.get(key)!.push(value);
    } else {
      map.set(key, [value]);
    }
  }

  return [...map.entries()].reduce(
    (acc, [key, value]) => {
      return setPath(acc, key, value.length === 1 ? value[0] : value);
    },
    {} as Record<string, unknown | unknown[]>,
  );
};

export interface $ZodFormDataInternals<
  Shape extends core.$ZodShape,
  Extra extends Record<string, unknown> = Record<string, unknown>,
> extends core.$ZodObjectLikeInternals<
    core.$InferObjectOutput<Shape, Extra>,
    FormData | FormDataLikeInput | core.$InferObjectInput<Shape, Extra>
  > {
  input: FormDataLikeInput;
}

export interface $ZodFormData<Shape extends core.$ZodShape = core.$ZodShape>
  extends core.$ZodType {
  _zod: $ZodFormDataInternals<Shape>;
}

/**
 * This helper takes the place of the `z.object` at the root of your schema.
 * It wraps your schema in a `z.preprocess` that extracts all the data out of a `FormData`
 * and transforms it into a regular object.
 * If the `FormData` contains multiple entries with the same field name,
 * it will automatically turn that field into an array.
 */
export const $ZodFormData: core.$constructor<$ZodFormData> =
  core.$constructor<$ZodFormData>("$ZodFormData", (inst, def) => {
    // @ts-expect-error FIXME: Why does this give an error?
    core.$ZodType.init(inst, def);
    // @ts-expect-error FIXME: Why does this give an error?
    core.$ZodObjectLike.init(inst, def);
  });

export const formData = <Shape extends core.$ZodShape>(
  shape: Shape,
  params?: core.$ZodObjectLikeParams,
): $ZodFormData<Shape> => {
  const def: core.$ZodObjectLikeDef = {
    type: "object",
    shape,
    get optional() {
      return core.util.optionalObjectKeys(shape);
    },
    ...core.util.normalizeParams(params),
  };
  return new $ZodFormData(def) as any;
};
