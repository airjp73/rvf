import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRvf } from "../react";
import userEvent from "@testing-library/user-event";
import { successValidator } from "./util/successValidator";
import { FieldErrors } from "@rvf/core";

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
      onSubmit: submit,
    });

    return (
      <form onSubmit={form.handleSubmit} data-testid="form">
        <div>
          <input data-testid="foo" {...form.control("foo")} />
          <button
            type="button"
            data-testid="focus-foo"
            onClick={() => form.focus("foo")}
          />
        </div>

        <input data-testid="bar" {...form.control("bar")} />
        <button
          type="button"
          data-testid="focus-bar"
          onClick={() => form.focus("bar")}
        />

        <div>
          <input data-testid="baz" {...form.control("baz")} />
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
      onSubmit: submit,
    });

    return (
      <form onSubmit={form.handleSubmit} data-testid="form">
        <div>
          <input data-testid="foo" {...form.control("foo")} />
        </div>

        <input data-testid="bar" {...form.control("bar")} />

        <div>
          <input data-testid="baz" {...form.control("baz")} />
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
