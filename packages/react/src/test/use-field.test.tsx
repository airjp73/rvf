import { render, screen } from "@testing-library/react";
import { useField } from "../field";
import { useRvf } from "../useRvf";
import { successValidator } from "./util/successValidator";
import userEvent from "@testing-library/user-event";
import { FormProvider } from "../context";

it("should be possible to use useField with a scoped form", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "foo",
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    const field = useField(form.scope("foo"));

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...field.getInputProps()} />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  await userEvent.type(screen.getByTestId("foo"), "test");
  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith(
    {
      foo: "footest",
    },
    expect.any(FormData),
    {},
  );
});

it("should be possible to use useField with context", async () => {
  const Field = () => {
    const field = useField<string>("foo");
    return <input data-testid="foo" {...field.getInputProps()} />;
  };

  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "foo",
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <FormProvider scope={form.scope()}>
        <form {...form.getFormProps()} data-testid="form">
          <Field />
          <button type="submit" data-testid="submit" />
        </form>
      </FormProvider>
    );
  };

  render(<TestComp />);
  await userEvent.type(screen.getByTestId("foo"), "test");
  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith(
    {
      foo: "footest",
    },
    expect.any(FormData),
    {},
  );
});

it("should be possible to use useField with scoped context", async () => {
  const Field = () => {
    const field = useField<string>("foo");
    return <input data-testid="foo" {...field.getInputProps()} />;
  };

  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        person: {
          foo: "foo",
        },
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <FormProvider scope={form.scope("person")}>
          <Field />
        </FormProvider>
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  await userEvent.type(screen.getByTestId("foo"), "test");
  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith(
    {
      person: {
        foo: "footest",
      },
    },
    expect.any(FormData),
    {},
  );
});

it("should work naturally with DOM submit source", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      submitSource: "dom",
      defaultValues: {
        foo: "foo",
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    const field = useField(form.scope("foo"));

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...field.getInputProps()} />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  await userEvent.type(screen.getByTestId("foo"), "test");
  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith(
    { foo: "footest" },
    expect.any(FormData),
    {},
  );
});
