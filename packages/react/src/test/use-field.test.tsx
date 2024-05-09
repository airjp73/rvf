import { render, screen } from "@testing-library/react";
import { useField } from "../field";
import { useRvf } from "../useRvf";
import { successValidator } from "./util/successValidator";
import userEvent from "@testing-library/user-event";
import { RvfProvider } from "../context";

it("should be possible to use useField with a scoped form", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "foo",
      },
      validator: successValidator,
      onSubmit: submit,
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
  expect(submit).toHaveBeenCalledWith({
    foo: "footest",
  });
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
      onSubmit: submit,
    });

    return (
      <RvfProvider scope={form.scope()}>
        <form {...form.getFormProps()} data-testid="form">
          <Field />
          <button type="submit" data-testid="submit" />
        </form>
      </RvfProvider>
    );
  };

  render(<TestComp />);
  await userEvent.type(screen.getByTestId("foo"), "test");
  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith({
    foo: "footest",
  });
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
      onSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <RvfProvider scope={form.scope("person")}>
          <Field />
        </RvfProvider>
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  await userEvent.type(screen.getByTestId("foo"), "test");
  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith({
    person: {
      foo: "footest",
    },
  });
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
      onSubmit: submit,
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
  expect(submit).toHaveBeenCalledWith({
    foo: "footest",
  });
});
