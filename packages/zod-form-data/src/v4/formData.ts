import { setPath } from "@rvf/set-get";
import { z } from "zod";
import * as core from "zod/v4/core";

import { isSchema } from "../utils";

const entriesSchema = z.array(z.tuple([z.string(), z.any()]));

const iteratorToArraySchema = z
  .any()
  .refine((val) => Symbol.iterator in val)
  .transform((val) => [...val]);

const processFormData =
  // We're avoiding using `instanceof` here because different environments
  // won't necessarily have `FormData` or `URLSearchParams`
  z.pipe(iteratorToArraySchema, entriesSchema).transform((data) => {
    const map = new Map<string, [unknown, ...unknown[]]>();
    for (const [key, value] of data) {
      if (map.has(key)) {
        map.get(key)!.push(value);
      } else {
        map.set(key, [value]);
      }
    }

    return [...map.entries()].reduce<
      Record<string, unknown | [unknown, unknown, ...unknown[]]>
    >(
      (acc, [key, value]) =>
        setPath(acc, key, value.length === 1 ? value[0] : value),
      {},
    );
  });

export const preprocessFormData = z.union([processFormData, z.unknown()]);

const _formData = <Output, Input, Schema extends core.$ZodType<Output, Input>>(
  schema: Schema,
) => z.pipe(preprocessFormData, schema);

const shapeToObject = <Shape extends core.$ZodLooseShape>(shape: Shape) =>
  z.object(shape);
export function formData<
  Output,
  Input,
  Schema extends core.$ZodType<Output, Input>,
>(schema: Schema): ReturnType<typeof _formData<Output, Input, Schema>>;

export function formData<Shape extends core.$ZodLooseShape>(
  shape: Shape,
): ReturnType<
  typeof _formData<unknown, unknown, ReturnType<typeof shapeToObject<Shape>>>
>;

/**
 * This helper takes the place of the `z.object` at the root of your schema.
 * It wraps your schema in a `z.preprocess` that extracts all the data out of a `FormData`
 * and transforms it into a regular object.
 * If the `FormData` contains multiple entries with the same field name,
 * it will automatically turn that field into an array.
 */
export function formData<
  Output,
  Input,
  Schema extends core.$ZodType<Output, Input>,
  Shape extends core.$ZodLooseShape,
>(schemaOrShape: Schema | Shape) {
  return isSchema<Output, Input, Schema, Shape>(schemaOrShape)
    ? _formData(schemaOrShape)
    : _formData(shapeToObject(schemaOrShape));
}
