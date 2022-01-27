import {
  z,
  ZodArray,
  ZodEffects,
  ZodNumber,
  ZodObject,
  ZodString,
  ZodType,
  ZodTypeAny,
} from "zod";

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

export const file: InputType<z.ZodType<File>> = (schema = z.instanceof(File)) =>
  z.preprocess((val) => {
    //Empty File object on no user input, so convert to undefined
    return val instanceof File && val.size === 0 ? undefined : val;
  }, schema);

interface FileObject {
  <Key extends string>(key: Key): z.ZodObject<{
    [key in Key]: z.ZodEffects<z.ZodType<File>>;
  }>;
  <Key extends string, ProvidedType extends z.ZodTypeAny>(
    key: Key,
    serverType: ProvidedType
  ): z.ZodObject<{
    [key in Key]: z.ZodEffects<ProvidedType>;
  }>;
}

//This is the correct typing but I can't figure out the TS error
export const fileObject: FileObject = (key, serverType) => {
  return z.object({
    [key]: serverType ? file(serverType) : file(),
  });
};

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

type FormDataType = {
  <T extends z.ZodRawShape>(shape: T): ZodEffects<ZodObject<T>>;
  <T extends z.ZodTypeAny>(schema: T): ZodEffects<T>;
};

export const formData: FormDataType = <T extends z.ZodRawShape | z.ZodTypeAny>(
  shapeOrSchema: T
) =>
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
    shapeOrSchema instanceof ZodType ? shapeOrSchema : z.object(shapeOrSchema)
  );
