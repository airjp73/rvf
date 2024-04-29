import { describe, expectTypeOf, it } from "vitest";
import { useRvf, FormFields } from "../react";
import { successValidator } from "./util/successValidator";

describe("types", () => {
  it("should only allow valid paths", () => {
    const Component = () => {
      const form = useRvf({
        validator: successValidator,
        initialValues: {
          foo: "bar",
          baz: {
            a: "quux",
            b: "quux",
          },
        },
        onSubmit: vi.fn(),
      });

      form.field("foo");
      form.field("baz.a");
      form.field("baz.b");

      // @ts-expect-error
      form.field("baz.c");
      // @ts-expect-error
      form.field("baz.a.b");
      // @ts-expect-error
      form.field("baz.a.c");

      type result = FormFields<typeof form>;
      expectTypeOf<result>().toEqualTypeOf<"foo" | "baz" | "baz.a" | "baz.b">();
    };
    expect(true).toBe(true);
  });
});
