import { useRvf } from "../useRvf";
import userEvent from "@testing-library/user-event";
import { forwardRef, useEffect, useRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RenderCounter } from "./util/RenderCounter";
import { successValidator } from "./util/successValidator";

it("captures and submits with uncontrolled fields", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "bar",
        baz: {
          a: "quux",
        },
      },
      validator: successValidator,
      onSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo")} />
        <input data-testid="baz.a" {...form.field("baz.a")} />
        <RenderCounter data-testid="render-count" />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toHaveValue("bar");
  expect(screen.getByTestId("baz.a")).toHaveValue("quux");
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.type(screen.getByTestId("foo"), "testing 123");
  await userEvent.type(screen.getByTestId("baz.a"), "another value");
  fireEvent.submit(screen.getByTestId("form"));

  await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
  expect(submit).toHaveBeenCalledWith({
    foo: "bartesting 123",
    baz: {
      a: "quuxanother value",
    },
  });

  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
});

it("should subscribe to value changes", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "bar",
        baz: {
          a: "quux",
        },
      },
      validator: successValidator,
      onSubmit: submit,
    });

    const renderCounter = useRef(0);
    renderCounter.current++;

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo")} />
        <pre data-testid="value">{form.value("foo")}</pre>
        <pre data-testid="render-count">{renderCounter.current}</pre>
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toHaveValue("bar");
  expect(screen.getByTestId("value")).toHaveTextContent("bar");
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.type(screen.getByTestId("foo"), "test");
  expect(screen.getByTestId("value")).toHaveTextContent("test");

  // Once for each keystroke + once for the initial render
  expect(screen.getByTestId("render-count")).toHaveTextContent("5");
});

it("should be posible to directly set a field value", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "bar",
        baz: {
          a: "quux",
        },
      },
      validator: successValidator,
      onSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo")} />
        <button
          type="button"
          data-testid="set-foo"
          onClick={() => form.setValue("foo", "test")}
        />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toHaveValue("bar");
  await userEvent.click(screen.getByTestId("set-foo"));
  expect(screen.getByTestId("foo")).toHaveValue("test");
});

it("should work with custom components", async () => {
  const submit = vi.fn();
  const Input = forwardRef(({ defaultValue, onChange }: any, ref: any) => (
    <input
      data-testid="foo"
      defaultValue={defaultValue}
      onChange={onChange}
      ref={ref}
    />
  ));

  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "bar",
      },
      validator: successValidator,
      onSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <Input {...form.field("foo")} />
        <button
          type="button"
          data-testid="set-foo"
          onClick={() => form.setValue("foo", "bob")}
        />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toHaveValue("bar");
  await userEvent.type(screen.getByTestId("foo"), "bob");
  expect(screen.getByTestId("foo")).toHaveValue("barbob");
  await userEvent.click(screen.getByTestId("set-foo"));
  expect(screen.getByTestId("foo")).toHaveValue("bob");
});

it.todo("should naturally work with boolean checkboxes");
it.todo("should naturally work with checkbox groups");
it.todo("should naturally work with radio groups");
