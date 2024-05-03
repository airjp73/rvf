import { useEffect, useState } from "react";
import { useRvf } from "../react";
import { RenderCounter } from "./util/RenderCounter";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { successValidator } from "./util/successValidator";

it("should be able to listen to value changes without rerendering", async () => {
  const valueListener = vi.fn();

  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "bar",
        baz: { a: "quux" },
      },
      validator: successValidator,
      onSubmit: submit,
    });

    useEffect(() => form.subscribe.value(valueListener), [form]);

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo")} />
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
    const form = useRvf({
      defaultValues: {
        foo: "",
        bar: "",
      },
      validator: successValidator,
      onSubmit: submit,
    });
    const [sub, setSub] = useState<"foo" | "bar">("foo");

    useEffect(() => {
      if (sub === "foo") return form.subscribe.value("foo", fooListener);
      return form.subscribe.value("bar", barListener);
    }, [form, sub]);

    return (
      <form {...form.getFormProps()} data-testid="form">
        <pre data-testid="sub">{sub}</pre>
        <input data-testid="foo" {...form.field("foo")} />
        <input data-testid="bar" {...form.field("bar")} />
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
