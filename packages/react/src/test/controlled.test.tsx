import { useRvf } from "../useRvf";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { successValidator } from "./util/successValidator";
import { controlInput } from "./util/controlInput";

it("captures and submits with controlled fields", async () => {
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
      handleSubmit: submit,
    });

    const renderCounter = useRef(0);
    renderCounter.current++;

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...controlInput(form.field("foo"))} />
        <input data-testid="baz.a" {...controlInput(form.field("baz.a"))} />
        <pre data-testid="render-count">{renderCounter.current}</pre>
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toHaveValue("bar");
  expect(screen.getByTestId("baz.a")).toHaveValue("quux");
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.type(screen.getByTestId("foo"), "test");
  await userEvent.type(screen.getByTestId("baz.a"), "bob");
  fireEvent.submit(screen.getByTestId("form"));

  await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
  expect(submit).toHaveBeenCalledWith({
    foo: "bartest",
    baz: {
      a: "quuxbob",
    },
  });

  // Once for each keystroke + once for the initial render
  expect(screen.getByTestId("render-count")).toHaveTextContent("8");
});

it("shoud work correctly when no default values exist", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useRvf({
      validator: successValidator,
      handleSubmit: submit,
    });

    const renderCounter = useRef(0);
    renderCounter.current++;

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...controlInput(form.field("foo"))} />
        <input data-testid="baz.a" {...controlInput(form.field("baz.a"))} />
        <pre data-testid="render-count">{renderCounter.current}</pre>
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toHaveValue("");
  expect(screen.getByTestId("baz.a")).toHaveValue("");
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.type(screen.getByTestId("foo"), "test");
  await userEvent.type(screen.getByTestId("baz.a"), "bob");
  fireEvent.submit(screen.getByTestId("form"));

  await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
  expect(submit).toHaveBeenCalledWith({
    foo: "test",
    baz: { a: "bob" },
  });

  // Once for each keystroke + once for the initial render
  expect(screen.getByTestId("render-count")).toHaveTextContent("8");
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
      handleSubmit: submit,
    });

    const renderCounter = useRef(0);
    renderCounter.current++;

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...controlInput(form.field("foo"))} />
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
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="baz.a" {...controlInput(form.field("baz.a"))} />
        <button
          type="button"
          data-testid="set-baz.a"
          onClick={() => form.setValue("baz.a", "bob")}
        />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("baz.a")).toHaveValue("quux");
  await userEvent.click(screen.getByTestId("set-baz.a"));
  expect(screen.getByTestId("baz.a")).toHaveValue("bob");
});

it("should work with custom components", async () => {
  const submit = vi.fn();
  const Input = ({ value, onChange }: any) => (
    <input data-testid="foo" value={value} onChange={onChange} />
  );

  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "bar",
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    const { ref, ...control } = controlInput(form.field("foo"));
    return (
      <form {...form.getFormProps()} data-testid="form">
        <Input {...control} />
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
