import { render, screen } from "@testing-library/react";
import { useForm } from "../useForm";
import { successValidator } from "./util/successValidator";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

it("should support passing errors in directly", async () => {
  const submit = vi.fn();
  const errors = {
    foo: "foo error",
    "baz.a": "baz error",
  };
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: "",
        baz: { a: "" },
      },
      serverValidationErrors: errors,
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()}>
        <input data-testid="foo" name="foo" />
        {form.error("foo") && (
          <div data-testid="foo-error">{form.error("foo")}</div>
        )}
        <input data-testid="baz.a" name="baz.a" />
        {form.error("baz.a") && (
          <div data-testid="baz.a-error">{form.error("baz.a")}</div>
        )}
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);

  expect(screen.getByTestId("foo-error")).toHaveTextContent("foo error");
  expect(screen.getByTestId("baz.a-error")).toHaveTextContent("baz error");
  await userEvent.type(screen.getByTestId("foo"), "testing 123");

  // They'll get cleared immediately because the validator doesn't actually have them
  expect(screen.queryByTestId("foo-error")).not.toBeInTheDocument();
  expect(screen.queryByTestId("baz.a-error")).not.toBeInTheDocument();
});

it("should focus the first invalid field when server validation errors are provided", async () => {
  const submit = vi.fn();
  const errors = {
    foo: "foo error",
    "baz.a": "baz error",
  };
  const TestComp = () => {
    const [showErrors, setShowErrors] = useState(false);
    const form = useForm({
      defaultValues: {
        foo: "",
        baz: { a: "" },
      },
      serverValidationErrors: showErrors ? errors : {},
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()}>
        <input data-testid="foo" name="foo" />
        <div data-testid="foo-error">{form.error("foo")}</div>
        <input data-testid="baz.a" name="baz.a" />
        <div data-testid="baz.a-error">{form.error("baz.a")}</div>
        <button
          type="button"
          onClick={() => setShowErrors(true)}
          data-testid="show-errors"
        />
      </form>
    );
  };

  render(<TestComp />);

  expect(screen.getByTestId("foo-error")).toBeEmptyDOMElement();
  expect(screen.getByTestId("baz.a-error")).toBeEmptyDOMElement();

  await userEvent.click(screen.getByTestId("show-errors"));
  expect(screen.getByTestId("foo-error")).toHaveTextContent("foo error");
  expect(screen.getByTestId("baz.a-error")).toHaveTextContent("baz error");

  expect(screen.getByTestId("foo")).toHaveFocus();
});
