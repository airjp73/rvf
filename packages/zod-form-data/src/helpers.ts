import { setPath } from "set-get";
import {
  input,
  z,
  ZodArray,
  ZodEffects,
  ZodNumber,
  ZodObject,
  ZodString,
  ZodType,
  ZodTypeAny,
} from "zod";

type ExtendsDefaultType<
  DefaultType extends ZodTypeAny,
  ProvidedType extends ZodTypeAny
> = (
  ProvidedType extends ZodType<any, any, infer Input>
    ? Input extends input<DefaultType>
      ? ProvidedType
      : never
    : never
) extends never
  ? never
  : ProvidedType;

type InputType<DefaultType extends ZodTypeAny> = {
  (): ZodEffects<DefaultType>;
  <ProvidedType extends ZodTypeAny>(
    schema: ProvidedType & ExtendsDefaultType<DefaultType, ProvidedType>
  ): ZodEffects<ProvidedType>;
};

const stripEmpty = z.literal("").transform(() => undefined);

const preprocessIfValid = (schema: ZodTypeAny) => (val: unknown) => {
  const result = schema.safeParse(val);
  if (result.success) return result.data;
  return val;
};

/**
 * Provides a version of `z.preprocess` that does not broaden the allowable input type of the
 * returned ZodEffects from `input<T>` to `unknown`. This is important for preserving type input
 * information for e.g. default values, or for the input types of `parse()` functions.
 *
 * This should be used when the preprocess function is not intended to broaden the allowable input
 * types from those of the provided schema.
 *
 * See: https://github.com/colinhacks/zod/pull/1752
 */
const preprocessWithoutUnknown = <T extends ZodTypeAny>(
  preprocessFn: Parameters<typeof z.preprocess>[0],
  schema: T
): ZodEffects<T> => z.preprocess(preprocessFn, schema);

/**
 * Transforms any empty strings to `undefined` before validating.
 * This makes it so empty strings will fail required checks,
 * allowing you to use `optional` for optional fields instead of `nonempty` for required fields.
 * If you call `zfd.text` with no arguments, it will assume the field is a required string by default.
 * If you want to customize the schema, you can pass that as an argument.
 */
export const text: InputType<ZodString> = (schema = z.string()) =>
  preprocessWithoutUnknown(preprocessIfValid(stripEmpty), schema);

/**
 * Coerces numerical strings to numbers transforms empty strings to `undefined` before validating.
 * If you call `zfd.number` with no arguments,
 * it will assume the field is a required number by default.
 * If you want to customize the schema, you can pass that as an argument.
 */
export const numeric: InputType<ZodNumber> = (schema = z.number()) =>
  preprocessWithoutUnknown(
    preprocessIfValid(
      z.union([
        stripEmpty,
        z
          .string()
          .transform((val) => Number(val))
          .refine((val) => !Number.isNaN(val)),
      ])
    ),
    schema
  );

type CheckboxOpts = {
  trueValue?: string;
};

/**
 * Turns the value from a checkbox field into a boolean,
 * but does not require the checkbox to be checked.
 * For checkboxes with a `value` attribute, you can pass that as the `trueValue` option.
 *
 * @example
 * ```ts
 * const schema = zfd.formData({
 *   defaultCheckbox: zfd.checkbox(),
 *   checkboxWithValue: zfd.checkbox({ trueValue: "true" }),
 *   mustBeTrue: zfd
 *     .checkbox()
 *     .refine((val) => val, "Please check this box"),
 *   });
 * });
 * ```
 */
export const checkbox = ({ trueValue = "on" }: CheckboxOpts = {}) =>
  z.union([
    z.literal(trueValue).transform(() => true),
    z.literal(undefined).transform(() => false),
  ]);

export const file: InputType<z.ZodType<File>> = (schema = z.instanceof(File)) =>
  preprocessWithoutUnknown((val) => {
    //Empty File object on no user input, so convert to undefined
    return val instanceof File && val.size === 0 ? undefined : val;
  }, schema);

/**
 * Preprocesses a field where you expect multiple values could be present for the same field name
 * and transforms the value of that field to always be an array.
 * If you don't provide a schema, it will assume the field is an array of zfd.text fields
 * and will not require any values to be present.
 */
export const repeatable: InputType<ZodArray<any>> = (
  schema = z.array(text())
) => {
  return preprocessWithoutUnknown((val) => {
    if (Array.isArray(val)) return val;
    if (val === undefined) return [];
    return [val];
  }, schema);
};

/**
 * A convenience wrapper for repeatable.
 * Instead of passing the schema for an entire array, you pass in the schema for the item type.
 */
export const repeatableOfType = <T extends ZodTypeAny>(
  schema: T
): ZodEffects<ZodArray<T>> => repeatable(z.array(schema));

const entries = z.array(z.tuple([z.string(), z.any()]));

type FormDataLikeInput = {
  [Symbol.iterator](): IterableIterator<[string, FormDataEntryValue]>;
  entries(): IterableIterator<[string, FormDataEntryValue]>;
};

type FormDataType = {
  <T extends z.ZodRawShape>(shape: T): ZodEffects<
    ZodObject<T>,
    z.output<ZodObject<T>>,
    FormData | FormDataLikeInput
  >;
  <T extends z.ZodTypeAny>(schema: T): ZodEffects<
    T,
    z.output<T>,
    FormData | FormDataLikeInput
  >;
};

const safeParseJson = (jsonString: string) => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return jsonString;
  }
};

export const json = <T extends ZodTypeAny>(schema: T): ZodEffects<T> =>
  z.preprocess(
    preprocessIfValid(
      z.union([stripEmpty, z.string().transform((val) => safeParseJson(val))])
    ),
    schema
  );

const processFormData = preprocessIfValid(
  // We're avoiding using `instanceof` here because different environments
  // won't necessarily have `FormData` or `URLSearchParams`
  z
    .any()
    .refine((val) => Symbol.iterator in val)
    .transform((val) => [...val])
    .refine(
      (val): val is z.infer<typeof entries> => entries.safeParse(val).success
    )
    .transform((data): Record<string, unknown | unknown[]> => {
      const map: Map<string, unknown[]> = new Map();
      for (const [key, value] of data) {
        if (map.has(key)) {
          map.get(key)!.push(value);
        } else {
          map.set(key, [value]);
        }
      }

      return [...map.entries()].reduce((acc, [key, value]) => {
        return setPath(acc, key, value.length === 1 ? value[0] : value);
      }, {} as Record<string, unknown | unknown[]>);
    })
);

export const preprocessFormData = processFormData as (
  formData: unknown
) => Record<string, unknown>;

/**
 * This helper takes the place of the `z.object` at the root of your schema.
 * It wraps your schema in a `z.preprocess` that extracts all the data out of a `FormData`
 * and transforms it into a regular object.
 * If the `FormData` contains multiple entries with the same field name,
 * it will automatically turn that field into an array.
 */
export const formData: FormDataType = (shapeOrSchema: any): any =>
  z.preprocess(
    processFormData,
    shapeOrSchema instanceof ZodType ? shapeOrSchema : z.object(shapeOrSchema)
  );
