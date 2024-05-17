import { render, screen } from "@testing-library/react";
import { useRvf } from "../useRvf";
import { successValidator } from "./util/successValidator";
import userEvent from "@testing-library/user-event";

it("should support passing errors in directly", async () => {
  const submit = vi.fn();
  const errors = {
    foo: "foo error",
    "baz.a": "baz error",
  };
  const TestComp = () => {
    const form = useRvf({
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
