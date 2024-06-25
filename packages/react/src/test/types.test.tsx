import { describe, expectTypeOf, it } from "vitest";
import { useForm } from "../useForm";
import { successValidator } from "./util/successValidator";
import { FormFields } from "../base";
import { FormScope } from "@rvf/core";
import { useField } from "../field";
import { ChangeEvent, FocusEvent, useRef } from "react";
import { MinimalInputProps } from "../inputs/getInputProps";

describe("types", () => {
  it("should only allow valid paths", () => {
    const Component = () => {
      const form = useForm({
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

  it("should infer input props", () => {
    const Component = () => {
      const scope = {} as any as FormScope<string>;
      const field = useField(scope);

      const ref = useRef<HTMLInputElement>(null);
      <input
        {...field.getInputProps({
          type: "text",
          value: "hello",
          onChange: (e) => {
            expectTypeOf(e).toEqualTypeOf<ChangeEvent<HTMLInputElement>>();
          },
          onBlur: (e) => {
            expectTypeOf(e).toEqualTypeOf<FocusEvent<HTMLInputElement>>();
          },
          ref,
          id: "123",
          "aria-label": "hello",
        })}
      />;
    };
  });
});
