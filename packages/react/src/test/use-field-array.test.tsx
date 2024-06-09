import { render, screen } from "@testing-library/react";
import { useFieldArray } from "../array";
import { useForm } from "../useForm";
import { successValidator } from "./util/successValidator";
import userEvent from "@testing-library/user-event";
import { FormProvider } from "../context";

it("should be possible to use useFieldArray with a scoped form", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: ["foo"],
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    const array = useFieldArray(form.scope("foo"));

    return (
      <form {...form.getFormProps()} data-testid="form">
        {array.map((key, item) => (
          <input
            key={key}
            data-testid="foo"
            {...item.field().getInputProps()}
          />
        ))}
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
      foo: ["footest"],
    },
    expect.any(FormData),
    {},
  );
});

it("should be possible to use useFieldArray with context", async () => {
  const Field = () => {
    const array = useFieldArray<string[]>("foo");
    return array.map((key, item) => (
      <input key={key} data-testid="foo" {...item.field().getInputProps()} />
    ));
  };

  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: ["foo"],
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
      foo: ["footest"],
    },
    expect.any(FormData),
    {},
  );
});

it("should be possible to use useFieldArray with scoped context", async () => {
  const Field = () => {
    const array = useFieldArray<string[]>("foo");
    return array.map((key, item) => (
      <input key={key} data-testid="foo" {...item.field().getInputProps()} />
    ));
  };

  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        person: {
          foo: ["foo"],
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
        foo: ["footest"],
      },
    },
    expect.any(FormData),
    {},
  );
});

it("should work naturally with DOM submit source", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      submitSource: "dom",
      defaultValues: {
        foo: ["foo"],
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    const array = useFieldArray(form.scope("foo"));

    return (
      <form {...form.getFormProps()} data-testid="form">
        {array.map((key, item) => (
          <input
            key={key}
            data-testid="foo"
            {...item.field().getInputProps()}
          />
        ))}
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  await userEvent.type(screen.getByTestId("foo"), "test");
  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith(
    { foo: ["footest"] },
    expect.any(FormData),
    {},
  );
});
