import { render, screen } from "@testing-library/react";
import { useRvf } from "../react";
import userEvent from "@testing-library/user-event";

it.todo("should not validate when novalidate is set", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "bar",
      },
      validator: () =>
        Promise.resolve({ data: undefined, error: { foo: "invalid" } }),
      onSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo")} />
        <button type="submit" formNoValidate data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalled();
});