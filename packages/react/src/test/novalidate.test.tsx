import { render, screen } from "@testing-library/react";
import { useRvf } from "../useRvf";
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
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo").getInputProps()} />
        <button type="submit" formNoValidate data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalled();
});
