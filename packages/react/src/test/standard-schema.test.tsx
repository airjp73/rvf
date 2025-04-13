import { z } from "zod";
import { useForm } from "../useForm";

// Skipped because these are only types tests
describe.skip("Standard schema types", () => {
  test("should require default values when using a standard schema", () => {
    // @ts-expect-error
    const form = useForm({
      schema: z.object({
        foo: z.string(),
      }),
      handleSubmit: ({ foo }) => Promise.resolve(foo),
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
    });
    expectTypeOf(form.value("foo")).toEqualTypeOf<string>();
    expectTypeOf(form.value("bar")).toEqualTypeOf<string | undefined>();
  });

  test("should be able to expand the default values type with a partial type", () => {
    const form = useForm({
      schema: z.object({
        foo: z.string(),
        bar: z.string(),
      }),
      defaultValues: {
        foo: "hi",
        ...({} as { bar?: string }),
      },
    });
    expectTypeOf(form.value("foo")).toEqualTypeOf<string>();
    expectTypeOf(form.value("bar")).toEqualTypeOf<string | undefined>();
  });

  test("should error if default values are missing a field and the types are expanded", () => {
    const form = useForm({
      schema: z.object({
        foo: z.string(),
        bar: z.string(),
      }),
      defaultValues: {
        // @ts-expect-error
        foo: 123 as number | string,
      },
    });
    expectTypeOf(form.value("foo")).toEqualTypeOf<string>();
    expectTypeOf(form.value("bar")).toEqualTypeOf<string>();
  });
});
