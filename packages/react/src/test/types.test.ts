import { describe, expectTypeOf, it } from "vitest";
import { useRvf } from "../useRvf";
import { successValidator } from "./util/successValidator";
import { FormFields } from "../base";

describe("types", () => {
  it("should only allow valid paths", () => {
    const Component = () => {
      const form = useRvf({
        validator: successValidator,
        defaultValues: {
          foo: "bar",
          baz: {
            a: "quux",
            b: "quux",
          },
        },
        handleSubmit: vi.fn(),
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
