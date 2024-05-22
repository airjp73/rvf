import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRvf } from "../useRvf";
import userEvent from "@testing-library/user-event";
import { RenderCounter } from "./util/RenderCounter";
import { FieldErrors, Rvf, createValidator } from "@rvf/core";
import { useField } from "../field";

it("should validate on onBlur, then on change after that", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "",
        baz: { a: "" },
      },
      validator: createValidator({
        validate: (data) => {
          const errors: FieldErrors = {};
          if (data.foo.length < 3) errors.foo = "too short";
          if (data.baz.a.length > 3) errors["baz.a"] = "too long";
          if (Object.keys(errors).length > 0)
            return Promise.resolve({ data: undefined, error: errors });
          return Promise.resolve({ data, error: undefined });
        },
      }),
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo").getInputProps()} />
        <pre data-testid="foo-error">{form.error("foo")}</pre>

        <input data-testid="baz.a" {...form.field("baz.a").getInputProps()} />
        <pre data-testid="baz.a-error">{form.error("baz.a")}</pre>

        <RenderCounter data-testid="render-count" />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toHaveValue("");
  expect(screen.getByTestId("foo-error")).toBeEmptyDOMElement();
  expect(screen.getByTestId("baz.a")).toHaveValue("");
  expect(screen.getByTestId("baz.a-error")).toBeEmptyDOMElement();
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.type(screen.getByTestId("foo"), "bo");
  await userEvent.type(screen.getByTestId("baz.a"), "test");
  await userEvent.click(screen.getByTestId("form")); // blur

  await waitFor(() =>
    expect(screen.getByTestId("foo-error")).toHaveTextContent("too short"),
  );
  expect(screen.getByTestId("baz.a-error")).toHaveTextContent("too long");

  await userEvent.type(screen.getByTestId("foo"), "b");
  await userEvent.type(screen.getByTestId("baz.a"), "{Backspace}");

  expect(screen.getByTestId("foo-error")).toBeEmptyDOMElement();
  expect(screen.getByTestId("baz.a-error")).toBeEmptyDOMElement();

  fireEvent.submit(screen.getByTestId("form"));

  await waitFor(() => {
    expect(submit).toHaveBeenCalledTimes(1);
  });
  expect(submit).toHaveBeenCalledWith(
    {
      foo: "bob",
      baz: { a: "tes" },
    },
    expect.any(FormData),
  );

  expect(screen.getByTestId("foo-error")).toBeEmptyDOMElement();
  expect(screen.getByTestId("baz.a-error")).toBeEmptyDOMElement();
  await waitFor(() => {
    expect(submit).toBeCalledTimes(1);
  });
  expect(screen.getByTestId("render-count").textContent).toMatchInlineSnapshot(
    `"9"`,
  );
});

it("should validate on onSubmit, if validationBehavior is onSubmit", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      validationBehaviorConfig: {
        initial: "onSubmit",
        whenTouched: "onSubmit",
        whenSubmitted: "onChange",
      },
      defaultValues: {
        foo: "",
        baz: { a: "" },
      },
      validator: createValidator({
        validate: (data) => {
          const errors: FieldErrors = {};
          if (data.foo.length < 3) errors.foo = "too short";
          if (data.baz.a.length > 3) errors["baz.a"] = "too long";
          if (Object.keys(errors).length > 0)
            return Promise.resolve({ data: undefined, error: errors });
          return Promise.resolve({ data, error: undefined });
        },
      }),
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo").getInputProps()} />
        <pre data-testid="foo-error">{form.error("foo")}</pre>

        <input data-testid="baz.a" {...form.field("baz.a").getInputProps()} />
        <pre data-testid="baz.a-error">{form.error("baz.a")}</pre>

        <RenderCounter data-testid="render-count" />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toHaveValue("");
  expect(screen.getByTestId("foo-error")).toBeEmptyDOMElement();
  expect(screen.getByTestId("baz.a")).toHaveValue("");
  expect(screen.getByTestId("baz.a-error")).toBeEmptyDOMElement();
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.type(screen.getByTestId("foo"), "bo");
  await userEvent.type(screen.getByTestId("baz.a"), "test");
  await userEvent.click(screen.getByTestId("form")); // blur

  // Invalid, but still don't show
  expect(screen.getByTestId("foo-error")).toBeEmptyDOMElement();
  expect(screen.getByTestId("baz.a-error")).toBeEmptyDOMElement();
  expect(screen.getByTestId("render-count").textContent).toMatchInlineSnapshot(
    `"3"`,
  );

  fireEvent.submit(screen.getByTestId("form"));

  await waitFor(() =>
    expect(screen.getByTestId("foo-error")).toHaveTextContent("too short"),
  );
  expect(screen.getByTestId("baz.a-error")).toHaveTextContent("too long");

  await userEvent.type(screen.getByTestId("foo"), "b");
  await userEvent.type(screen.getByTestId("baz.a"), "{Backspace}");

  expect(screen.getByTestId("foo-error")).toBeEmptyDOMElement();
  expect(screen.getByTestId("baz.a-error")).toBeEmptyDOMElement();

  fireEvent.submit(screen.getByTestId("form"));

  await waitFor(() => {
    expect(submit).toHaveBeenCalledTimes(1);
  });
  expect(submit).toHaveBeenCalledWith(
    {
      foo: "bob",
      baz: { a: "tes" },
    },
    expect.any(FormData),
  );

  expect(screen.getByTestId("foo-error")).toBeEmptyDOMElement();
  expect(screen.getByTestId("baz.a-error")).toBeEmptyDOMElement();
  await waitFor(() => {
    expect(submit).toBeCalledTimes(1);
  });
  expect(screen.getByTestId("render-count").textContent).toMatchInlineSnapshot(
    `"9"`,
  );
});

it("should handle dependant validations", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        password: "",
        confirmPassword: "",
      },
      validator: createValidator({
        validate: (data) => {
          if (data.password !== data.confirmPassword)
            return Promise.resolve({
              data: undefined,
              error: { confirmPassword: "not equal" },
            });
          return Promise.resolve({ data, error: undefined });
        },
      }),
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input
          data-testid="password"
          {...form.field("password").getInputProps()}
        />
        <input
          data-testid="confirmPassword"
          {...form.field("confirmPassword").getInputProps()}
        />
        <pre data-testid="error">{form.error("confirmPassword")}</pre>

        <RenderCounter data-testid="render-count" />
      </form>
    );
  };

  render(<TestComp />);

  await userEvent.type(screen.getByTestId("password"), "test");
  expect(screen.getByTestId("error")).toBeEmptyDOMElement();

  fireEvent.submit(screen.getByTestId("form"));
  await waitFor(() =>
    expect(screen.getByTestId("error")).toHaveTextContent("not equal"),
  );

  await userEvent.type(screen.getByTestId("confirmPassword"), "test");
  expect(screen.getByTestId("error")).toBeEmptyDOMElement();

  await userEvent.type(screen.getByTestId("password"), "A");
  expect(screen.getByTestId("error")).toHaveTextContent("not equal");

  await userEvent.type(screen.getByTestId("password"), "{Backspace}");
  expect(screen.getByTestId("error")).toBeEmptyDOMElement();

  fireEvent.submit(screen.getByTestId("form"));
  await waitFor(() => {
    expect(submit).toBeCalledTimes(1);
  });
  expect(submit).toHaveBeenCalledWith(
    {
      password: "test",
      confirmPassword: "test",
    },
    expect.any(FormData),
  );
});

it("should be possible to customize validation behavior", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "",
      },
      validator: createValidator({
        validate: (data) => {
          const errors: FieldErrors = {};
          if (data.foo.length < 3) errors.foo = "too short";
          if (Object.keys(errors).length > 0)
            return Promise.resolve({ data: undefined, error: errors });
          return Promise.resolve({ data, error: undefined });
        },
      }),
      handleSubmit: submit,
      validationBehaviorConfig: {
        initial: "onBlur",
        whenTouched: "onChange",
        whenSubmitted: "onChange",
      },
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo").getInputProps()} />
        <pre data-testid="foo-error">{form.error("foo")}</pre>
        <RenderCounter data-testid="render-count" />
      </form>
    );
  };

  render(<TestComp />);

  await userEvent.type(screen.getByTestId("foo"), "12");
  expect(screen.getByTestId("foo-error")).toBeEmptyDOMElement();

  await userEvent.click(screen.getByTestId("form"));
  await waitFor(() => {
    expect(screen.getByTestId("foo-error")).toHaveTextContent("too short");
  });

  await userEvent.type(screen.getByTestId("foo"), "12");
  expect(screen.getByTestId("foo-error")).toBeEmptyDOMElement();

  await userEvent.type(screen.getByTestId("foo"), "{Backspace}{Backspace}");
  await waitFor(() => {
    expect(screen.getByTestId("foo-error")).toHaveTextContent("too short");
  });
});

it("should be posible to customize validation behavior at the field level", async () => {
  const behaviorConfig = {
    initial: "onBlur",
    whenTouched: "onChange",
    whenSubmitted: "onChange",
  } as const;

  const submit = vi.fn();

  const Input = ({ form }: { form: Rvf<string> }) => {
    const field = useField(form, { validationBehavior: behaviorConfig });
    return <input data-testid="foo" {...field.getInputProps()} />;
  };

  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "",
      },
      validator: createValidator({
        validate: (data) => {
          const errors: FieldErrors = {};
          if (data.foo.length < 3) errors.foo = "too short";
          if (Object.keys(errors).length > 0)
            return Promise.resolve({ data: undefined, error: errors });
          return Promise.resolve({ data, error: undefined });
        },
      }),
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <Input form={form.scope("foo")} />
        <pre data-testid="foo-error">{form.error("foo")}</pre>
        <RenderCounter data-testid="render-count" />
      </form>
    );
  };

  render(<TestComp />);

  await userEvent.type(screen.getByTestId("foo"), "12");
  expect(screen.getByTestId("foo-error")).toBeEmptyDOMElement();

  await userEvent.click(screen.getByTestId("form"));
  await waitFor(() => {
    expect(screen.getByTestId("foo-error")).toHaveTextContent("too short");
  });

  await userEvent.type(screen.getByTestId("foo"), "12");
  expect(screen.getByTestId("foo-error")).toBeEmptyDOMElement();

  await userEvent.type(screen.getByTestId("foo"), "{Backspace}{Backspace}");
  await waitFor(() => {
    expect(screen.getByTestId("foo-error")).toHaveTextContent("too short");
  });
});

it.todo("should use validation adapters");

it.todo(
  "changing a field with a validationBehavior of onChange should not show errors on another, touched field",
);
