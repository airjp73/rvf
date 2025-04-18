import { z } from "zod";
import { useForm } from "../useForm";
import { FormApi } from "../base";
import { StandardSchemaV1 } from "@standard-schema/spec";

// Skipped because these are only types tests
describe.skip("Standard schema types", () => {
  test("should require default values when using a standard schema", () => {
    // @ts-expect-error
    const form = useForm({
      schema: z.object({
        foo: z.string(),
      }),
      handleSubmit: (data) => {
        expectTypeOf(data).toEqualTypeOf<{ foo: string }>();
      },
    });
  });

  test("should allow a schema when that matches the default values", () => {
    const form = useForm({
      schema: z.object({
        foo: z.string(),
      }),
      defaultValues: {
        foo: "",
      },
      handleSubmit: (data) => {
        expectTypeOf(data).toEqualTypeOf<{ foo: string }>();
      },
    });
    expectTypeOf(form.value("foo")).toEqualTypeOf<string>();
  });

  test("should not allow a schema when that doesn't match the default values", () => {
    const form = useForm({
      schema: z.object({
        foo: z.string(),
      }),
      defaultValues: {
        // @ts-expect-error
        foo: 1,
      },
      handleSubmit: (data) => {
        expectTypeOf(data).toEqualTypeOf<{ foo: string }>();
      },
    });
    expectTypeOf(form.value("foo")).toEqualTypeOf<string>();
  });

  test("should allow a schema where the input type is assignable to the default values", () => {
    const form = useForm({
      schema: z.object({
        foo: z.string(),
      }),
      defaultValues: {
        foo: 1 as number | string,
      },
      handleSubmit: (data) => {
        expectTypeOf(data).toEqualTypeOf<{ foo: string }>();
      },
    });
    expectTypeOf(form.value("foo")).toEqualTypeOf<string | number>();
  });

  test("should error if default values are missing a field", () => {
    const form = useForm({
      schema: z.object({
        foo: z.string(),
        bar: z.string(),
      }),
      // @ts-expect-error
      defaultValues: {
        foo: "hi",
      },
      handleSubmit: (data) => {
        expectTypeOf(data).toEqualTypeOf<{ foo: string; bar: string }>();
      },
    });
    expectTypeOf(form.value("foo")).toEqualTypeOf<string>();
    expectTypeOf(form.value("bar")).toEqualTypeOf<string>();
  });

  test("should be able to expand a type to include undefined", () => {
    const form = useForm({
      schema: z.object({
        foo: z.string(),
        bar: z.string(),
      }),
      defaultValues: {
        foo: "hi",
        bar: undefined as string | undefined,
      },
      handleSubmit: (data) => {
        expectTypeOf(data).toEqualTypeOf<{ foo: string; bar: string }>();
      },
    });
    expectTypeOf(form.value("foo")).toEqualTypeOf<string>();
    expectTypeOf(form.value("bar")).toEqualTypeOf<string | undefined>();
  });

  test("should be able to expand the default values that include an optional field or nullable field", () => {
    const f1 = useForm({
      schema: z.object({
        foo: z.union([z.string(), z.number()]),
        bar: z.string(),
      }),
      defaultValues: {
        foo: "hi",
        bar: 123 as string | number,
      },
    });
    expectTypeOf(f1).toEqualTypeOf<
      FormApi<{
        foo: string | number;
        bar: string | number;
      }>
    >();

    useForm({
      schema: z.object({
        foo: z.string(),
        bar: z.string(),
      }),
      defaultValues: {
        foo: "hi",
        bar: "",
        // @ts-expect-error
        baz: "",
      },
    });
  });

  test("should error if default values are missing a field and the types are expanded", () => {
    const form = useForm({
      schema: z.object({
        foo: z.string(),
        bar: z.string(),
      }),
      // @ts-expect-error
      defaultValues: {
        foo: 123 as number | string,
      },
      handleSubmit: (data) => {
        expectTypeOf(data).toEqualTypeOf<{ foo: string; bar: string }>();
      },
    });
    expectTypeOf(form.value("foo")).toEqualTypeOf<string | number>();
    expectTypeOf(form.value("bar")).toEqualTypeOf<string>();
  });

  test("should error if default values are an object and the schema is a primitive", () => {
    const form = useForm({
      schema: z.object({
        foo: z.string(),
      }),
      defaultValues: {
        // @ts-expect-error
        foo: { bar: "" },
      },
    });
    expectTypeOf(form).toEqualTypeOf<FormApi<{ foo: string }>>();
  });

  test("should use only the default value if the schema input is unknown", () => {
    const form = useForm({
      schema: {} as any as StandardSchemaV1<{ foo: unknown }>,
      defaultValues: {
        foo: "hi there",
      },
    });
    expectTypeOf(form).toEqualTypeOf<FormApi<{ foo: string }>>();
  });

  test("should work with classes", () => {
    const form = useForm({
      schema: z.object({
        text: z.string(),
        number: z.number(),
        checkbox: z.boolean(),
        radio: z.string(),
        file: z.instanceof(File),
      }),
      defaultValues: {
        text: "Hello",
        number: 123,
        checkbox: true,
        radio: "value1",
        file: null as File | null,
      },
    });

    test("should work with unions", () => {
      const form = useForm({
        schema: z.object({
          foo: z.string().or(z.number()),
        }),
        defaultValues: {
          foo: "hi there" as string | number | null,
        },
      });
      expectTypeOf(form).toEqualTypeOf<
        FormApi<{ foo: string | number | null }>
      >();
    });

    test("should work with arrays", () => {
      const form = useForm({
        schema: z.object({
          foo: z.array(z.string()),
        }),
        defaultValues: {
          foo: ["hi there"],
        },
      });
      expectTypeOf(form).toEqualTypeOf<FormApi<{ foo: string[] }>>();
      form.array("foo");
    });

    test("should work with objects", () => {
      const form = useForm({
        schema: z.object({
          foo: z.object({
            label: z.string(),
            value: z.string(),
          }),
        }),
        defaultValues: {
          foo: null as { label: string; value: string } | null,
        },
      });
      expectTypeOf(form).toEqualTypeOf<
        FormApi<{ foo: { label: string; value: string } | null }>
      >();
    });

    class Custom<T> {
      _value: T;
      constructor(value: T) {
        this._value = value;
      }
    }

    test("should work with custom, generic classes", () => {
      const form = useForm({
        schema: z.object({
          foo: z.instanceof(Custom<string>),
        }),
        defaultValues: {
          foo: null as Custom<string | null> | null,
        },
      });

      // It isn't able to preserve the class name in the output type but it works
      expectTypeOf(form).toEqualTypeOf<
        FormApi<{ foo: Custom<string | null> | null }>
      >();
    });
  });
});
