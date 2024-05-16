import { createValidator } from "@rvf/core";
import { useRvf } from "../useRvf";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("should show errors via native validation by default", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useRvf({
      defaultValues: { foo: "" },
      validator: createValidator({
        validate: (data) => {
          if (data.foo === "testing 123")
            return Promise.resolve({
              error: { foo: "Invalid" },
              data: undefined,
            });
          return Promise.resolve({ data, error: undefined });
        },
      }),
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" name={form.name("foo")} />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  // Default values don't work for this case, so the values will be different
  expect(screen.getByTestId("foo")).toHaveValue("");

  await userEvent.type(screen.getByTestId("foo"), "testing 123");
  await userEvent.click(screen.getByTestId("submit"));

  expect(submit).not.toHaveBeenCalled();
  expect(screen.getByTestId("foo")).toBeInvalid();
  await userEvent.type(screen.getByTestId("foo"), "bro");
  expect(screen.getByTestId("foo")).toBeValid();

  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith({
    foo: "testing 123bro",
  });
});
