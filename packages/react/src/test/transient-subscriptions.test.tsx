import { useEffect, useState } from "react";
import { useForm } from "../useForm";
import { RenderCounter } from "./util/RenderCounter";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { successValidator } from "./util/successValidator";
import { useFormScope } from "../useFormScope";

it("should be able to listen to value changes without rerendering", async () => {
  const valueListener = vi.fn();

  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: "bar",
        baz: { a: "quux" },
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    useEffect(() => form.subscribe.value(valueListener), [form]);

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo").getInputProps()} />
        <RenderCounter data-testid="render-count" />
      </form>
    );
  };

  render(<TestComp />);
  expect(valueListener).toHaveBeenCalledTimes(0);
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.type(screen.getByTestId("foo"), "test");
  expect(valueListener).toHaveBeenCalledTimes(4);
  expect(valueListener).toHaveBeenLastCalledWith({
    foo: "bartest",
    baz: { a: "quux" },
  });

  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
});

it("should unsubscribe from value changes when the effect unmounts", async () => {
  const fooListener = vi.fn();
  const barListener = vi.fn();

  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: "",
        bar: "",
      },
      validator: successValidator,
      handleSubmit: submit,
    });
    const [sub, setSub] = useState<"foo" | "bar">("foo");

    useEffect(() => {
      if (sub === "foo") return form.subscribe.value("foo", fooListener);
      return form.subscribe.value("bar", barListener);
    }, [form, sub]);

    return (
      <form {...form.getFormProps()} data-testid="form">
        <pre data-testid="sub">{sub}</pre>
        <input data-testid="foo" {...form.field("foo").getInputProps()} />
        <input data-testid="bar" {...form.field("bar").getInputProps()} />
        <button
          type="button"
          data-testid="sub-to-bar"
          onClick={() => setSub("bar")}
        />
        <RenderCounter data-testid="render-count" />
      </form>
    );
  };

  render(<TestComp />);
  expect(fooListener).toHaveBeenCalledTimes(0);
  expect(barListener).toHaveBeenCalledTimes(0);
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.type(screen.getByTestId("foo"), "t");
  expect(fooListener).toHaveBeenCalledTimes(1);
  expect(barListener).toHaveBeenCalledTimes(0);

  await userEvent.type(screen.getByTestId("bar"), "est");
  expect(fooListener).toHaveBeenCalledTimes(1);
  expect(barListener).toHaveBeenCalledTimes(0);

  await userEvent.click(screen.getByTestId("sub-to-bar"));
  expect(screen.getByTestId("sub")).toHaveTextContent("bar");

  await userEvent.type(screen.getByTestId("foo"), "est");
  expect(fooListener).toHaveBeenCalledTimes(1);
  expect(barListener).toHaveBeenCalledTimes(0);

  await userEvent.type(screen.getByTestId("bar"), "t");
  expect(fooListener).toHaveBeenCalledTimes(1);
  expect(barListener).toHaveBeenCalledTimes(1);
});

it("should respect scoping", async () => {
  const valueListener = vi.fn();

  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: "bar",
        baz: { a: "quux" },
      },
      validator: successValidator,
      handleSubmit: submit,
    });
    const scopedForm = useFormScope(form.scope("foo"));

    useEffect(() => scopedForm.subscribe.value(valueListener), [scopedForm]);

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo").getInputProps()} />
        <RenderCounter data-testid="render-count" />
      </form>
    );
  };

  render(<TestComp />);
  expect(valueListener).toHaveBeenCalledTimes(0);
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.type(screen.getByTestId("foo"), "test");
  expect(valueListener).toHaveBeenCalledTimes(4);
  expect(valueListener).toHaveBeenLastCalledWith("bartest");

  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
});
