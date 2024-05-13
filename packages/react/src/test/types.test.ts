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
          bob: [{ deeper: "value" }],
        },
        handleSubmit: vi.fn(),
      });

      form.field("foo");
      form.field("baz.a");
      form.field("baz.b");
      form.field("bob[0]");
      form.field("bob.0");
      form.field("bob[0].deeper");

      // @ts-expect-error
      form.field("baz.c");
      // @ts-expect-error
      form.field("baz.a.b");
      // @ts-expect-error
      form.field("baz.a.c");

      type result = FormFields<typeof form>;
      expectTypeOf<result>().toEqualTypeOf<
        | "foo"
        | "baz"
        | "baz.a"
        | "baz.b"
        | "bob"
        | `bob[${number}]`
        | `bob.${number}`
        | `bob[${number}].deeper`
        | `bob.${number}.deeper`
      >();
    };
    expect(true).toBe(true);
  });
});
