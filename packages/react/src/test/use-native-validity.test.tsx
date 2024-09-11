import { useId, useRef, useState } from "react";
import {
  useNativeValidity,
  unstable_useNativeValidityForForm as useNativeValidityForForm,
} from "../useNativeValidity";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useField } from "../field";
import { createValidator, FieldErrors, FormScope } from "@rvf/core";
import { useForm } from "../useForm";

describe("useNativeValidity", () => {
  it("should setCustomValidity on the input when the error changes", async () => {
    const Comp = () => {
      const ref = useRef<HTMLInputElement>(null);
      const [error, setError] = useState("test");
      useNativeValidity(ref, error);
      return (
        <div>
          <input ref={ref} data-testid="input" />
          <button
            type="button"
            onClick={() => setError("")}
            data-testid="clear"
          />
          <button
            type="button"
            onClick={() => setError("jimbo")}
            data-testid="change"
          />
        </div>
      );
    };

    render(<Comp />);

    expect(screen.getByTestId("input")).toBeInvalid();

    await userEvent.click(screen.getByTestId("clear"));
    expect(screen.getByTestId("input")).toBeValid();

    await userEvent.click(screen.getByTestId("change"));
    expect(screen.getByTestId("input")).toBeInvalid();
  });

  it("should combo with getInputProps", async () => {
    const MyInput = ({
      scope,
      label,
    }: {
      scope: FormScope<string>;
      label: string;
    }) => {
      const field = useField(scope);
      const id = useId();

      const ref = useRef<HTMLInputElement>(null);
      useNativeValidity(ref, field.error());

      return (
        <div>
          <label htmlFor={id}>{label}</label>
          <input {...field.getInputProps({ id, ref })} data-testid="input" />
        </div>
      );
    };

    const Comp = () => {
      const form = useForm({
        defaultValues: {
          foo: "",
        },
        validator: createValidator({
          validate: () =>
            Promise.resolve({ data: undefined, error: { foo: "some error" } }),
        }),
        handleSubmit: vi.fn(),
      });
      return (
        <form {...form.getFormProps()}>
          <MyInput scope={form.scope("foo")} label="Label" />
          <button type="submit" data-testid="submit" />
        </form>
      );
    };

    render(<Comp />);
    await userEvent.click(screen.getByTestId("submit"));
    expect(screen.getByTestId("input")).toBeInvalid();
  });
});

describe("useNativeValidityForForm", () => {
  it("should setCustomValidity on invalid inputs in the form", async () => {
    const Comp = () => {
      const form = useForm({
        validator: createValidator({
          validate: (data) => {
            const errors: FieldErrors = {};
            if (data.foo === "") errors.foo = "required";
            if (data.bar === "") errors.bar = "required";

            if (Object.keys(errors).length > 0)
              return Promise.resolve({ data: undefined, error: errors });
            return Promise.resolve({ data, error: undefined });
          },
        }),
        validationBehaviorConfig: {
          initial: "onChange",
          whenTouched: "onChange",
          whenSubmitted: "onChange",
        },
      });
      useNativeValidityForForm(form.scope());

      return (
        <form {...form.getFormProps()}>
          <input name="foo" data-testid="foo" />
          <input name="bar" data-testid="bar" />
          <button data-testid="submit" />
        </form>
      );
    };

    render(<Comp />);
    await userEvent.click(screen.getByTestId("submit"));
    expect(screen.getByTestId("foo")).toBeInvalid();
    expect(screen.getByTestId("bar")).toBeInvalid();

    await userEvent.type(screen.getByTestId("foo"), "test");
    expect(screen.getByTestId("foo")).toBeValid();
    expect(screen.getByTestId("bar")).toBeInvalid();

    await userEvent.type(screen.getByTestId("bar"), "test");
    expect(screen.getByTestId("foo")).toBeValid();
    expect(screen.getByTestId("bar")).toBeValid();
  });

  it("should set the validity to all elements of a given name", async () => {
    const Comp = () => {
      const form = useForm({
        validator: createValidator({
          validate: (data) => {
            const errors: FieldErrors = {};
            if (
              !data.foo ||
              (Array.isArray(data.foo) && data.foo.every((f) => !f))
            )
              errors.foo = "required";
            if (Object.keys(errors).length > 0)
              return Promise.resolve({ data: undefined, error: errors });
            return Promise.resolve({ data, error: undefined });
          },
        }),
        validationBehaviorConfig: {
          initial: "onChange",
          whenTouched: "onChange",
          whenSubmitted: "onChange",
        },
      });
      useNativeValidityForForm(form.scope());

      return (
        <form {...form.getFormProps()}>
          <input name="foo" data-testid="foo-1" />
          <input name="foo" data-testid="foo-2" />
          <button data-testid="submit" />
        </form>
      );
    };

    render(<Comp />);
    await userEvent.click(screen.getByTestId("submit"));
    expect(screen.getByTestId("foo-1")).toBeInvalid();
    expect(screen.getByTestId("foo-2")).toBeInvalid();

    await userEvent.type(screen.getByTestId("foo-1"), "test");
    expect(screen.getByTestId("foo-1")).toBeValid();
    expect(screen.getByTestId("foo-2")).toBeValid();
  });
});
