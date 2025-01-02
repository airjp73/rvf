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
});
