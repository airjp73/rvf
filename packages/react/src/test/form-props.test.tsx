import { render, screen } from "@testing-library/react";
import { useForm } from "../useForm";
import { successValidator } from "./util/successValidator";
import userEvent from "@testing-library/user-event";
import { RenderCounter } from "./util/RenderCounter";

it("should cancel submission if the native onSubmit calls preventDefault", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: "bar",
      },
      validator: successValidator,
      handleSubmit: submit,
    });
    return (
      <form
        {...form.getFormProps({ onSubmit: (event) => event.preventDefault() })}
        data-testid="form"
      >
        <input data-testid="foo" {...form.field("foo").getInputProps()} />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toHaveValue("bar");

  await userEvent.type(screen.getByTestId("foo"), "testing 123");
  await userEvent.click(screen.getByTestId("submit"));

  expect(submit).not.toHaveBeenCalled();
});

it("should cancel reset if the native onReset calls preventDefault", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: "bar",
      },
      validator: successValidator,
      handleSubmit: submit,
    });
    return (
      <form
        {...form.getFormProps({ onReset: (event) => event.preventDefault() })}
        data-testid="form"
      >
        <input data-testid="foo" {...form.field("foo").getInputProps()} />
        <button type="reset" data-testid="reset" />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toHaveValue("bar");

  await userEvent.type(screen.getByTestId("foo"), "testing 123");
  await userEvent.click(screen.getByTestId("reset"));

  expect(screen.getByTestId("foo")).toHaveValue("bartesting 123");
});

it("should not over-rerender when using otherFormProps", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: "bar",
      },
      otherFormProps: {
        "data-testid": "form",
      } as any,
      validator: successValidator,
      handleSubmit: submit,
    });
    return (
      <form {...form.getFormProps()}>
        <input data-testid="foo" {...form.field("foo").getInputProps()} />
        <button type="reset" data-testid="reset" />
        <RenderCounter data-testid="render-count" />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toHaveValue("bar");
  await userEvent.type(screen.getByTestId("foo"), "testing 123");
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
});
