import { z } from "zod";
import { useForm } from "../useForm";
import { StandardSchemaV1 } from "@standard-schema/spec";
import { Validator } from "@rvf/core";

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
    form.setValue("foo", "test");
  });

  test("should not allow schema and validator at the same time", () => {
    const form = useForm({
      schema: z.object({
        foo: z.string(),
      }),
      // @ts-expect-error
      validator: successValidator,
      defaultValues: { foo: "" },
    });
  });

  test("validators should continue to work", () => {
    const form = useForm({
      defaultValues: {
        foo: {
          bar: "bar",
          baz: "baz",
        },
      },
      validator: {} as Validator<any>,
    });
    form.setValue("foo.bar", "test");
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
    form.setValue("foo", "test");
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
    form.setValue("foo", "test");
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
    form.setValue("foo", "test");
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
    form.setValue("foo", "test");
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
    form.setValue("foo", "test");
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
    f1.setValue("foo", "test");

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
    form.setValue("foo", "test");
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
    form.setValue("foo", "test");
  });

  test("should use only the default value if the schema input is unknown", () => {
    const form = useForm({
      schema: {} as any as StandardSchemaV1<{ foo: unknown }>,
      defaultValues: {
        foo: "hi there",
      },
    });
    expectTypeOf(form).toEqualTypeOf<FormApi<{ foo: "hi there" }>>();
    form.setValue("foo", "hi there");
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
        bar: z.array(z.object({ baz: z.string() })),
      }),
      defaultValues: {
        foo: ["hi there"],
        bar: [],
      },
    });
    expectTypeOf(form).toEqualTypeOf<
      FormApi<{ foo: string[]; bar: { baz: string }[] }>
    >();
    form.array("foo").push("");
  });

  test("should work deeply nested", () => {
    const form = useForm({
      schema: z.object({
        foo: z.object({
          bar: z.object({
            baz: z.object({
              qux: z.object({
                blah: z.string(),
              }),
            }),
          }),
        }),
      }),
      defaultValues: {
        foo: { bar: { baz: { qux: { blah: "" as string | number } } } },
      },
    });
  });

  const tuple = <T extends any[]>(...value: T): [...T] => [...value];

  test("should work with tuples", () => {
    const form = useForm({
      schema: z.object({
        foo: z.tuple([z.string(), z.number()]),
        bar: z.tuple([
          z.object({ foo: z.string() }),
          z.object({ bar: z.string() }),
        ]),
      }),
      defaultValues: {
        foo: ["hi there", 123 as string | number],
        bar: [{ foo: "foo" as string | number }, { bar: "bar" }],
      },
    });
    expectTypeOf(form).toEqualTypeOf<
      FormApi<{
        foo: [string, string | number];
        bar: [{ foo: string | number }, { bar: string }];
      }>
    >();
    form.array("foo").push("");
  });

  test("should reject default value tuples of a different length", () => {
    const form = useForm({
      schema: z.object({
        foo: z.tuple([z.string(), z.string()]),
      }),
      defaultValues: {
        // @ts-expect-error
        foo: ["one", "two", "three"],
      },
    });
    expectTypeOf(form).toEqualTypeOf<
      FormApi<{
        foo: [string, string];
      }>
    >();
    form.array("foo").push("");
  });

  test("should work with readonly arrays", () => {
    const form = useForm({
      schema: z.object({
        foo: z.array(z.string()).readonly(),
      }),
      defaultValues: {
        foo: ["one", "two", "three"],
      },
    });
    expectTypeOf(form).toEqualTypeOf<FormApi<{ foo: readonly string[] }>>();
    form.array("foo").push("");
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
