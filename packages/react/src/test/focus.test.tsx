import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRvf } from "../useRvf";
import userEvent from "@testing-library/user-event";
import { successValidator } from "./util/successValidator";
import { FieldErrors } from "@rvf/core";
import { controlInput } from "./util/controlInput";

it("should be able to manually focus fields", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "",
        bar: "",
        baz: "",
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <div>
          <input data-testid="foo" {...form.field("foo").getInputProps()} />
          <button
            type="button"
            data-testid="focus-foo"
            onClick={() => form.focus("foo")}
          />
        </div>

        <input data-testid="bar" {...controlInput(form.field("bar"))} />
        <button
          type="button"
          data-testid="focus-bar"
          onClick={() => form.focus("bar")}
        />

        <div>
          <input data-testid="baz" {...controlInput(form.field("baz"))} />
          <button
            type="button"
            data-testid="focus-baz"
            onClick={() => form.focus("baz")}
          />
        </div>
      </form>
    );
  };

  render(<TestComp />);

  await userEvent.click(screen.getByTestId("focus-foo"));
  expect(screen.getByTestId("foo")).toHaveFocus();

  await userEvent.click(screen.getByTestId("focus-bar"));
  expect(screen.getByTestId("bar")).toHaveFocus();

  await userEvent.click(screen.getByTestId("focus-baz"));
  expect(screen.getByTestId("baz")).toHaveFocus();
});

it("should be automatically focus fields when there are submit validation errors", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "",
        bar: "",
        baz: "",
      },
      validator: (data) => {
        const errors: FieldErrors = {};
        if (data.foo.length > 3) errors.foo = "too long";
        if (data.bar.length > 3) errors.bar = "too long";
        if (data.baz.length > 3) errors.baz = "too long";
        if (Object.keys(errors).length > 0)
          return Promise.resolve({ error: errors, data: undefined });
        return Promise.resolve({ data, error: undefined });
      },
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <div>
          <input data-testid="foo" {...controlInput(form.field("foo"))} />
        </div>

        <input data-testid="bar" {...controlInput(form.field("bar"))} />

        <div>
          <input data-testid="baz" {...controlInput(form.field("baz"))} />
        </div>
      </form>
    );
  };

  render(<TestComp />);

  await userEvent.type(screen.getByTestId("foo"), "1234");
  await userEvent.type(screen.getByTestId("bar"), "1234");
  await userEvent.type(screen.getByTestId("baz"), "1234");
  await userEvent.click(screen.getByTestId("form")); // blur

  fireEvent.submit(screen.getByTestId("form"));
  await waitFor(() => expect(screen.getByTestId("foo")).toHaveFocus());

  await userEvent.type(screen.getByTestId("foo"), "{Backspace}");
  await userEvent.click(screen.getByTestId("form")); // blur
  fireEvent.submit(screen.getByTestId("form"));
  await waitFor(() => expect(screen.getByTestId("bar")).toHaveFocus());

  await userEvent.type(screen.getByTestId("bar"), "{Backspace}");
  await userEvent.click(screen.getByTestId("form")); // blur
  fireEvent.submit(screen.getByTestId("form"));
  await waitFor(() => expect(screen.getByTestId("baz")).toHaveFocus());

  await userEvent.type(screen.getByTestId("foo"), "4");
  await userEvent.click(screen.getByTestId("form")); // blur
  fireEvent.submit(screen.getByTestId("form"));
  await waitFor(() => expect(screen.getByTestId("foo")).toHaveFocus());
});

it.todo(
  "should be possible to turn off focus on error using the `disableFocusOnError` option",
);
