import { render, screen } from "@testing-library/react";
import { useFieldArray } from "../array";
import { useRvf } from "../useRvf";
import { successValidator } from "./util/successValidator";
import userEvent from "@testing-library/user-event";
import { RvfProvider } from "../context";

it("should be possible to use useFieldArray with a scoped form", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: ["foo"],
      },
      validator: successValidator,
      onSubmit: submit,
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
  expect(submit).toHaveBeenCalledWith({
    foo: ["footest"],
  });
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
    const form = useRvf({
      defaultValues: {
        foo: ["foo"],
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
    foo: ["footest"],
  });
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
    const form = useRvf({
      defaultValues: {
        person: {
          foo: ["foo"],
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
      foo: ["footest"],
    },
  });
});

it("should work naturally with DOM submit source", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      submitSource: "dom",
      defaultValues: {
        foo: ["foo"],
      },
      validator: successValidator,
      onSubmit: submit,
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
  expect(submit).toHaveBeenCalledWith({
    foo: ["footest"],
  });
});
