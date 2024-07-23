import { useId, useRef, useState } from "react";
import { useNativeValidity } from "../useNativeValidity";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useField } from "../field";
import { createValidator, FormScope } from "@rvf/core";
import { useForm } from "../useForm";

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
