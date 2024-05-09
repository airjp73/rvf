import { useRvf } from "../useRvf";
import userEvent from "@testing-library/user-event";
import { forwardRef, useEffect, useRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RenderCounter } from "./util/RenderCounter";
import { successValidator } from "./util/successValidator";
import { RvfReact } from "../base";
import { controlInput, controlNumberInput } from "./util/controlInput";

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
        <input data-testid="foo" {...form.field("foo").getInputProps()} />
        <input data-testid="baz.a" {...form.field("baz.a").getInputProps()} />
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
        <input
          data-testid="foo"
          {...form.field("foo").getInputProps({ type: "number" })}
        />
        <input
          data-testid="bar"
          {...controlNumberInput(form.field("bar"))}
          type="number"
        />
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
        <input data-testid="foo" {...form.field("foo").getInputProps()} />
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
        <input data-testid="foo" {...form.field("foo").getInputProps()} />
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
        <Input {...form.field("foo").getInputProps()} />
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

it("should naturally work with boolean checkboxes", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: true,
      },
      validator: successValidator,
      onSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input
          data-testid="foo"
          {...form.field("foo").getInputProps({ type: "checkbox" })}
        />
        <RenderCounter data-testid="render-count" />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toBeChecked();
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.click(screen.getByTestId("foo"));
  expect(screen.getByTestId("foo")).not.toBeChecked();

  await userEvent.click(screen.getByTestId("foo"));
  expect(screen.getByTestId("foo")).toBeChecked();

  await userEvent.click(screen.getByTestId("foo"));
  await userEvent.click(screen.getByTestId("submit"));
  await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
  expect(submit).toHaveBeenCalledWith({
    foo: false,
  });

  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
});

it("should naturally work with checkbox groups", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: ["bar", "baz"],
      },
      validator: successValidator,
      onSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input
          data-testid="foo"
          {...form
            .field("foo")
            .getInputProps({ type: "checkbox", value: "foo" })}
        />
        <input
          data-testid="bar"
          {...form
            .field("foo")
            .getInputProps({ type: "checkbox", value: "bar" })}
        />
        <input
          data-testid="baz"
          {...form
            .field("foo")
            .getInputProps({ type: "checkbox", value: "baz" })}
        />
        <RenderCounter data-testid="render-count" />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).not.toBeChecked();
  expect(screen.getByTestId("bar")).toBeChecked();
  expect(screen.getByTestId("baz")).toBeChecked();
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.click(screen.getByTestId("foo"));
  expect(screen.getByTestId("foo")).toBeChecked();
  expect(screen.getByTestId("bar")).toBeChecked();
  expect(screen.getByTestId("baz")).toBeChecked();

  await userEvent.click(screen.getByTestId("baz"));
  expect(screen.getByTestId("foo")).toBeChecked();
  expect(screen.getByTestId("bar")).toBeChecked();
  expect(screen.getByTestId("baz")).not.toBeChecked();

  await userEvent.click(screen.getByTestId("bar"));
  expect(screen.getByTestId("foo")).toBeChecked();
  expect(screen.getByTestId("bar")).not.toBeChecked();
  expect(screen.getByTestId("baz")).not.toBeChecked();

  await userEvent.click(screen.getByTestId("baz"));
  expect(screen.getByTestId("foo")).toBeChecked();
  expect(screen.getByTestId("bar")).not.toBeChecked();
  expect(screen.getByTestId("baz")).toBeChecked();

  await userEvent.click(screen.getByTestId("submit"));
  await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
  expect(submit).toHaveBeenCalledWith({
    foo: ["foo", "baz"],
  });

  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
});

it("should naturally work with radio groups", async () => {
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
      <form {...form.getFormProps()} data-testid="form">
        <input
          data-testid="foo"
          {...form.field("foo").getInputProps({ type: "radio", value: "foo" })}
        />
        <input
          data-testid="bar"
          {...form.field("foo").getInputProps({ type: "radio", value: "bar" })}
        />
        <input
          data-testid="baz"
          {...form.field("foo").getInputProps({ type: "radio", value: "baz" })}
        />
        <RenderCounter data-testid="render-count" />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toBeChecked();
  expect(screen.getByTestId("bar")).not.toBeChecked();
  expect(screen.getByTestId("baz")).not.toBeChecked();
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.click(screen.getByTestId("bar"));
  expect(screen.getByTestId("foo")).not.toBeChecked();
  expect(screen.getByTestId("bar")).toBeChecked();
  expect(screen.getByTestId("baz")).not.toBeChecked();

  await userEvent.click(screen.getByTestId("baz"));
  expect(screen.getByTestId("foo")).not.toBeChecked();
  expect(screen.getByTestId("bar")).not.toBeChecked();
  expect(screen.getByTestId("baz")).toBeChecked();

  await userEvent.click(screen.getByTestId("bar"));
  expect(screen.getByTestId("foo")).not.toBeChecked();
  expect(screen.getByTestId("bar")).toBeChecked();
  expect(screen.getByTestId("baz")).not.toBeChecked();

  await userEvent.click(screen.getByTestId("submit"));
  await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
  expect(submit).toHaveBeenCalledWith({
    foo: "bar",
  });

  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
});
