import { describe, expectTypeOf, it } from "vitest";
import { useForm } from "../useForm";
import { successValidator } from "./util/successValidator";
import { FormApi, FormFields } from "../base";
import { FormScope, Validator } from "@rvf/core";
import { useField } from "../field";
import { ChangeEvent, FocusEvent, useRef } from "react";
import { useFormScope } from "../useFormScope";

describe("types", () => {
  it("should only allow valid paths", () => {
    const Component = () => {
      const form = useForm({
        validator: successValidator as Validator<{
          foo: string;
          baz: { a: string; b: string };
          jim: { name: string }[];
        }>,
        defaultValues: {
          foo: "bar",
          baz: {
            a: "quux",
            b: "quux",
          },
          jim: [{ name: "jimbob" }],
          record: {} as Record<string, number>,
        },
        handleSubmit: async (data) => {
          expectTypeOf(data).toEqualTypeOf<{
            foo: string;
            baz: { a: string; b: string };
            jim: { name: string }[];
          }>();
          return {};
        },
      });

      form.field("foo");
      form.field("baz.a");
      form.field("baz.b");
      form.scope("jim[0]").scope("name");

      expectTypeOf(form.scope("record.bob")).toEqualTypeOf<FormScope<number>>;

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
        | "jim"
        | `jim[${number}]`
        | `jim[${number}].name`
        | "record"
        | `record.${string}`
      >();
    };
    expect(true).toBe(true);
  });

  it("should allow any path when no default values are provided (validator)", () => {
    const form = useForm({
      validator: successValidator as Validator<{ foo: string }>,
    });
    expectTypeOf(form).toEqualTypeOf<FormApi<any>>();
    form.value("asdf");
    form.array("awef");
  });

  it("should infer form scope correctly", () => {
    const Component = () => {
      type Node = { value: number; children: Node[] };
      const scope = {} as any as FormScope<{ tree: Node }>;
      const form = useFormScope(scope);
      expectTypeOf(form.scope("tree.value")).toEqualTypeOf<FormScope<number>>();
      expectTypeOf(form.value("tree.value")).toEqualTypeOf<number>();
    };
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
