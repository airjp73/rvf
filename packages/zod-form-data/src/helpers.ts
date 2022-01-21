import { z, ZodArray, ZodEffects, ZodNumber, ZodString, ZodTypeAny } from "zod";

type InputType<DefaultType extends ZodTypeAny> = {
  (): ZodEffects<DefaultType>;
  <ProvidedType extends ZodTypeAny>(
    schema: ProvidedType
  ): ZodEffects<ProvidedType>;
};

const stripEmpty = z.literal("").transform(() => undefined);

const preprocessIfValid = (schema: ZodTypeAny) => (val: unknown) => {
  const result = schema.safeParse(val);
  if (result.success) return result.data;
  return val;
};

export const text: InputType<ZodString> = (schema = z.string()) =>
  z.preprocess(preprocessIfValid(stripEmpty), schema);

export const numeric: InputType<ZodNumber> = (schema = z.number()) =>
  z.preprocess(
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

export const checkbox = ({ trueValue = "on" }: CheckboxOpts = {}) =>
  z.union([
    z.literal(trueValue).transform(() => true),
    z.literal(undefined).transform(() => false),
  ]);

export const repeatable: InputType<ZodArray<any>> = (
  schema = z.array(text())
) => {
  return z.preprocess((val) => {
    if (Array.isArray(val)) return val;
    if (val === undefined) return [];
    return [val];
  }, schema);
};

export const repeatableOfType = <T extends ZodTypeAny>(
  schema: T
): ZodEffects<ZodArray<T>> => repeatable(z.array(schema));

const entries = z.array(z.tuple([z.string(), z.any()]));

export const formData = (shape: z.ZodRawShape) =>
  z.preprocess(
    preprocessIfValid(
      // We're avoiding using `instanceof` here because different environments
      // won't necessarily have `FormData` or `URLSearchParams`
      z
        .any()
        .refine((val) => Symbol.iterator in val)
        .transform((val) => [...val])
        .refine(
          (val): val is z.infer<typeof entries> =>
            entries.safeParse(val).success
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
            acc[key] = value.length === 1 ? value[0] : value;
            return acc;
          }, {} as Record<string, unknown | unknown[]>);
        })
    ),
    z.object(shape)
  );
