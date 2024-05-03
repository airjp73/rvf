import { render, screen } from "@testing-library/react";
import { useRvf } from "../react";
import userEvent from "@testing-library/user-event";
import { successValidator } from "./util/successValidator";

it("should handle number inputs", async () => {
  const submit = vi.fn();
  const useIt = () =>
    useRvf({
      defaultValues: { foo: 0, bar: 0 },
      validator: successValidator,
      onSubmit: submit,
    });

  let form: ReturnType<typeof useIt> | null = null as any;

  const TestComp = () => {
    form = useIt();
    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo")} type="number" />
        <input data-testid="bar" {...form.control("bar")} type="number" />
      </form>
    );
  };

  render(<TestComp />);
  expect(form?.value("foo")).toBe(0);
  expect(form?.value("bar")).toBe(0);

  expect(screen.getByTestId("foo")).toHaveValue(0);
  expect(screen.getByTestId("bar")).toHaveValue(0);

  await userEvent.type(screen.getByTestId("foo"), "123");
  await userEvent.type(screen.getByTestId("bar"), "234");

  expect(screen.getByTestId("foo")).toHaveValue(123);
  expect(screen.getByTestId("bar")).toHaveValue(234);

  expect(form?.value("foo")).toBe(123);
  expect(form?.value("bar")).toBe(234);
});

it("should handle boolean checkboxes", async () => {
  const submit = vi.fn();
  const useIt = () =>
    useRvf({
      defaultValues: { foo: false, bar: false },
      validator: successValidator,
      onSubmit: submit,
    });

  let form: ReturnType<typeof useIt> | null = null as any;

  const TestComp = () => {
    form = useIt();
    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.checkbox("foo")} type="checkbox" />
      </form>
    );
  };

  render(<TestComp />);
  expect(form?.value("foo")).toBe(false);
  expect(screen.getByTestId("foo")).not.toBeChecked();

  await userEvent.click(screen.getByTestId("foo"));
  expect(form?.value("foo")).toBe(true);
  expect(screen.getByTestId("foo")).toBeChecked();

  await userEvent.click(screen.getByTestId("foo"));
  expect(form?.value("foo")).toBe(false);
  expect(screen.getByTestId("foo")).not.toBeChecked();
});
