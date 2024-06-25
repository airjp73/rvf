import { useState } from "react";
import { useForm } from "../useForm";
import userEvent from "@testing-library/user-event";
import { forwardRef, useRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RenderCounter } from "./util/RenderCounter";
import { successValidator } from "./util/successValidator";
import { controlNumberInput } from "./util/controlInput";
import { FieldErrors, createValidator } from "@rvf/core";
import { Field } from "../field";

it("captures and submits with uncontrolled fields", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
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
  expect(submit).toHaveBeenCalledWith(
    {
      foo: "bartesting 123",
      baz: {
        a: "quuxanother value",
      },
    },
    expect.any(FormData),
    {},
  );

  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
});

it("works when using getInputProps directly from the form", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
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
        <input data-testid="foo" {...form.getInputProps("foo")} />
        <input data-testid="baz.a" {...form.getInputProps("baz.a")} />
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
  expect(submit).toHaveBeenCalledWith(
    {
      foo: "bartesting 123",
      baz: {
        a: "quuxanother value",
      },
    },
    expect.any(FormData),
    {},
  );

  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
});

it("should work with the component version of Field", async () => {
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
      <form {...form.getFormProps()} data-testid="form">
        <Field scope={form.scope("foo")}>
          {(field) => <input data-testid="foo" {...field.getInputProps()} />}
        </Field>
        <RenderCounter data-testid="render-count" />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toHaveValue("bar");
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.type(screen.getByTestId("foo"), "testing 123");
  fireEvent.submit(screen.getByTestId("form"));

  await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
  expect(submit).toHaveBeenCalledWith(
    {
      foo: "bartesting 123",
    },
    expect.any(FormData),
    {},
  );

  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
});

it("captures and submits without registering uncontrolled inputs", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
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
        <input data-testid="foo" name={form.name("foo")} />
        <input data-testid="baz.a" name={form.name("baz.a")} />
        <button type="submit" data-testid="submit" />
        <RenderCounter data-testid="render-count" />
      </form>
    );
  };

  render(<TestComp />);
  // Default values don't work for thi case
  expect(screen.getByTestId("foo")).toHaveValue("");
  expect(screen.getByTestId("baz.a")).toHaveValue("");
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.type(screen.getByTestId("foo"), "testing 123");
  await userEvent.type(screen.getByTestId("baz.a"), "another value");
  await userEvent.click(screen.getByTestId("submit"));

  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith(
    {
      foo: "testing 123",
      baz: {
        a: "another value",
      },
    },
    expect.any(FormData),
    {},
  );

  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
});

it("validates and submits without registering uncontrolled inputs outside a form", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: "",
      },
      validator: createValidator({
        validate: (data) => {
          const errors: FieldErrors = {};
          if (data.foo == "") errors.foo = "required";
          if (Object.keys(errors).length > 0)
            return Promise.resolve({ data: undefined, error: errors });
          return Promise.resolve({ data, error: undefined });
        },
      }),
      handleSubmit: submit,
      id: "test",
    });

    return (
      <>
        <input data-testid="foo" name={form.name("foo")} form="test" />
        <div data-testid="foo-error">{form.error("foo")}</div>
        <form {...form.getFormProps()} data-testid="form">
          <button type="submit" data-testid="submit" />
          <RenderCounter data-testid="render-count" />
        </form>
      </>
    );
  };

  render(<TestComp />);
  // Default values don't work for thi case
  expect(screen.getByTestId("foo")).toHaveValue("");
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.click(screen.getByTestId("submit"));
  expect(screen.getByTestId("foo-error")).toHaveTextContent("required");

  await userEvent.type(screen.getByTestId("foo"), "testing 123");
  expect(screen.getByTestId("foo-error")).toBeEmptyDOMElement();

  await userEvent.click(screen.getByTestId("submit"));

  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith(
    { foo: "testing 123" },
    expect.any(FormData),
    {},
  );

  expect(screen.getByTestId("render-count").textContent).toMatchInlineSnapshot(
    `"3"`,
  );
});

it("should update `value` with auto-form", async () => {
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
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" name={form.name("foo")} />
        <pre data-testid="foo-value">{form.value("foo")}</pre>
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  // Default values don't work for this case, so the values will be different
  expect(screen.getByTestId("foo")).toHaveValue("");
  expect(screen.getByTestId("foo-value")).toHaveTextContent("bar");

  await userEvent.type(screen.getByTestId("foo"), "testing 123");
  expect(screen.getByTestId("foo-value")).toHaveTextContent("testing 123");

  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith(
    {
      foo: "testing 123",
    },
    expect.any(FormData),
    {},
  );
});

it("should validate with auto-form", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      defaultValues: { foo: "" },
      validator: createValidator({
        validate: (data) => {
          if (data.foo === "testing 123")
            return Promise.resolve({
              error: { foo: "Invalid" },
              data: undefined,
            });
          return Promise.resolve({ data, error: undefined });
        },
      }),
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" name={form.name("foo")} />
        <pre data-testid="foo-error">{form.error("foo")}</pre>
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  // Default values don't work for this case, so the values will be different
  expect(screen.getByTestId("foo")).toHaveValue("");

  await userEvent.type(screen.getByTestId("foo"), "testing 123");
  await userEvent.click(screen.getByTestId("submit"));

  expect(submit).not.toHaveBeenCalled();
  expect(screen.getByTestId("foo-error")).toHaveTextContent("Invalid");
  await userEvent.type(screen.getByTestId("foo"), "bro");
  expect(screen.getByTestId("foo-error")).toHaveTextContent("");

  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith(
    {
      foo: "testing 123bro",
    },
    expect.any(FormData),
    {},
  );
});

it("shoud work correctly when no default values exist", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      validator: successValidator,
      handleSubmit: submit,
    });

    const renderCounter = useRef(0);
    renderCounter.current++;

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo").getInputProps()} />
        <input data-testid="baz.a" {...form.field("baz.a").getInputProps()} />
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
  expect(submit).toHaveBeenCalledWith(
    {
      foo: "test",
      baz: { a: "bob" },
    },
    expect.any(FormData),
    {},
  );

  // Once for each keystroke + once for the initial render
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
});

it("should work correctly when the input is unmounted and remounted", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: "bar",
      },
      validator: successValidator,
      handleSubmit: submit,
    });
    const [show, setShow] = useState(true);

    return (
      <form {...form.getFormProps()} data-testid="form">
        {show && (
          <input data-testid="foo" {...form.field("foo").getInputProps()} />
        )}
        <button
          data-testid="toggle"
          type="button"
          onClick={() => setShow((prev) => !prev)}
        />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toHaveValue("bar");

  await userEvent.type(screen.getByTestId("foo"), "testing 123");
  expect(screen.getByTestId("foo")).toHaveValue("bartesting 123");

  await userEvent.click(screen.getByTestId("toggle"));
  expect(screen.queryByTestId("foo")).not.toBeInTheDocument();

  await userEvent.click(screen.getByTestId("toggle"));
  expect(screen.getByTestId("foo")).toHaveValue("bartesting 123");
});

it("should handle number inputs", async () => {
  const submit = vi.fn();
  const useIt = () =>
    useForm({
      defaultValues: { foo: 0, bar: 0 },
      validator: successValidator,
      handleSubmit: submit,
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
    const form = useForm({
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
    const form = useForm({
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
    const form = useForm({
      defaultValues: {
        foo: "bar",
      },
      validator: successValidator,
      handleSubmit: submit,
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
    const form = useForm({
      defaultValues: {
        foo: true,
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input
          data-testid="foo"
          value="test-value"
          {...form.field("foo").getInputProps({ type: "checkbox" })}
        />
        <pre data-testid="foo-value">{JSON.stringify(form.value("foo"))}</pre>
        <RenderCounter data-testid="render-count" />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toBeChecked();
  expect(screen.getByTestId("foo-value")).toHaveTextContent("true");
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.click(screen.getByTestId("foo"));
  expect(screen.getByTestId("foo")).not.toBeChecked();
  expect(screen.getByTestId("foo-value")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("foo"));
  expect(screen.getByTestId("foo")).toBeChecked();
  expect(screen.getByTestId("foo-value")).toHaveTextContent("true");

  await userEvent.click(screen.getByTestId("submit"));
  await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
  expect(submit).toHaveBeenCalledWith(
    { foo: "test-value" },
    expect.any(FormData),
    {},
  );

  expect(screen.getByTestId("render-count")).toHaveTextContent("3");
});

it("should use a boolean as the default value if none is provided", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input
          data-testid="foo"
          {...form.field("foo").getInputProps({ type: "checkbox" })}
        />
        <pre data-testid="foo-value">{JSON.stringify(form.value("foo"))}</pre>
        <RenderCounter data-testid="render-count" />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).not.toBeChecked();
  expect(screen.getByTestId("foo-value")).toHaveTextContent("");
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.click(screen.getByTestId("foo"));
  expect(screen.getByTestId("foo")).toBeChecked();
  expect(screen.getByTestId("foo-value")).toHaveTextContent("true");

  await userEvent.click(screen.getByTestId("foo"));
  expect(screen.getByTestId("foo")).not.toBeChecked();
  expect(screen.getByTestId("foo-value")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("foo"));
  expect(screen.getByTestId("foo")).toBeChecked();
  expect(screen.getByTestId("foo-value")).toHaveTextContent("true");

  await userEvent.click(screen.getByTestId("submit"));
  await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
  expect(submit).toHaveBeenCalledWith({ foo: "on" }, expect.any(FormData), {});

  expect(screen.getByTestId("render-count")).toHaveTextContent("4");
});

it("should naturally work with checkbox groups", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: ["bar", "baz"],
      },
      validator: successValidator,
      handleSubmit: submit,
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
  expect(submit).toHaveBeenCalledWith(
    {
      foo: ["foo", "baz"],
    },
    expect.any(FormData),
    {},
  );

  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
});

it("should naturally work with radio groups", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: "foo",
      },
      validator: successValidator,
      handleSubmit: submit,
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
  expect(submit).toHaveBeenCalledWith(
    {
      foo: "bar",
    },
    expect.any(FormData),
    {},
  );

  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
});

it("should auto-connect fields outside of the form", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: "bar",
      },
      validator: successValidator,
      handleSubmit: submit,
      submitSource: "dom",
    });

    return (
      <>
        <input data-testid="foo" {...form.field("foo").getInputProps()} />
        <form {...form.getFormProps()} data-testid="form">
          <button type="submit" data-testid="submit" />
        </form>
      </>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toHaveValue("bar");

  await userEvent.type(screen.getByTestId("foo"), "testing 123");
  await userEvent.click(screen.getByTestId("submit"));

  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith(
    { foo: "bartesting 123" },
    expect.any(FormData),
    {},
  );
});

it("should work with selects", async () => {
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
      <>
        <form {...form.getFormProps()}>
          <select data-testid="foo" {...form.field("foo").getInputProps()}>
            <option value="bar">Bar</option>
            <option value="baz">Baz</option>
          </select>
          <pre data-testid="foo-value">{form.value("foo")}</pre>
          <button type="submit" data-testid="submit" />
        </form>
      </>
    );
  };

  render(<TestComp />);

  await userEvent.selectOptions(screen.getByTestId("foo"), "baz");
  expect(screen.getByTestId("foo")).toHaveValue("baz");
  expect(screen.getByTestId("foo-value")).toHaveTextContent("baz");

  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith({ foo: "baz" }, expect.any(FormData), {});
});

it("should work with multi-selects", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: ["bar"],
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <>
        <form {...form.getFormProps()}>
          <select
            data-testid="foo"
            {...form.field("foo").getInputProps({ multiple: true })}
          >
            <option value="bar">Bar</option>
            <option value="baz">Baz</option>
          </select>
          <pre data-testid="foo-value">{JSON.stringify(form.value("foo"))}</pre>
          <button type="submit" data-testid="submit" />
        </form>
      </>
    );
  };

  render(<TestComp />);

  const select = screen.getByTestId("foo") as HTMLSelectElement;
  const opts = () =>
    Array.from(select.selectedOptions).map((option) => option.value);
  expect(screen.getByTestId("foo-value")).toHaveTextContent(`["bar"]`);
  expect(opts()).toEqual(["bar"]);

  await userEvent.selectOptions(screen.getByTestId("foo"), ["bar", "baz"]);
  expect(opts()).toEqual(["bar", "baz"]);
  expect(screen.getByTestId("foo-value")).toHaveTextContent(`["bar","baz"]`);

  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith(
    { foo: ["bar", "baz"] },
    expect.any(FormData),
    {},
  );
});

it("multi-selects should be able to set the default value with multiple elements and submit a signle value", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: ["bar", "baz"],
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <>
        <form {...form.getFormProps()}>
          <select
            data-testid="foo"
            {...form.field("foo").getInputProps({
              multiple: true,
            })}
          >
            <option value="bar">Bar</option>
            <option value="baz">Baz</option>
          </select>
          <pre data-testid="foo-value">{JSON.stringify(form.value("foo"))}</pre>
          <button type="submit" data-testid="submit" />
        </form>
      </>
    );
  };

  render(<TestComp />);

  expect(screen.getByTestId("foo-value")).toHaveTextContent(`["bar","baz"]`);
  await userEvent.deselectOptions(screen.getByTestId("foo"), ["baz"]);

  expect(screen.getByTestId("foo-value")).toHaveTextContent(`["bar"]`);
  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith({ foo: "bar" }, expect.any(FormData), {});
});

it("should be posssible to set the value of an uncontrolled select", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: ["bar"] as string | string[],
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <>
        <form {...form.getFormProps()}>
          <select
            data-testid="foo"
            {...form.field("foo").getInputProps({
              multiple: true,
            })}
          >
            <option value="bar">Bar</option>
            <option value="baz">Baz</option>
          </select>
          <button
            type="button"
            data-testid="set-foo"
            onClick={() => form.setValue("foo", ["bar", "baz"])}
          />
          <button type="submit" data-testid="submit" />
        </form>
      </>
    );
  };

  render(<TestComp />);

  const select = screen.getByTestId("foo") as HTMLSelectElement;
  const opts = () =>
    Array.from(select.selectedOptions).map((option) => option.value);

  expect(opts()).toEqual(["bar"]);

  await userEvent.click(screen.getByTestId("set-foo"));
  expect(opts()).toEqual(["bar", "baz"]);
});

it("should be able to set the value of an uncontrolled select", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      submitSource: "state",
      defaultValues: {
        foo: "bar",
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <>
        <form {...form.getFormProps()}>
          <select data-testid="foo" {...form.field("foo").getInputProps()}>
            <option value="bar">Bar</option>
            <option value="baz">Baz</option>
          </select>
          <button
            type="button"
            data-testid="set-foo"
            onClick={() => form.setValue("foo", "baz")}
          />
          <button type="submit" data-testid="submit" />
        </form>
      </>
    );
  };

  render(<TestComp />);

  await userEvent.click(screen.getByTestId("set-foo"));
  expect(screen.getByTestId("foo")).toHaveValue("baz");

  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith({ foo: "baz" }, {});
});

it("should handle multiple uncontrolled text inputs with the same name", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: [],
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <>
        <form {...form.getFormProps()}>
          <input
            data-testid="foo-1"
            {...form.field("foo").getInputProps({ type: "text" })}
          />
          <input
            data-testid="foo-2"
            {...form.field("foo").getInputProps({ type: "text" })}
          />
          <input
            data-testid="foo-3"
            {...form.field("foo").getInputProps({ type: "text" })}
          />
          <button type="submit" data-testid="submit" />
        </form>
      </>
    );
  };

  render(<TestComp />);

  await userEvent.type(screen.getByTestId("foo-1"), "foo");
  await userEvent.type(screen.getByTestId("foo-2"), "bar");
  await userEvent.type(screen.getByTestId("foo-3"), "baz");

  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith(
    { foo: ["foo", "bar", "baz"] },
    expect.any(FormData),
    {},
  );
});
