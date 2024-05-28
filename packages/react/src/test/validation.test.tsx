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
      validationBehaviorConfig: {
        initial: "onChange",
        whenTouched: "onChange",
        whenSubmitted: "onChange",
      },
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
  await userEvent.click(screen.getByTestId("form")); // blur
  expect(screen.getByTestId("error")).toBeEmptyDOMElement();

  await userEvent.type(screen.getByTestId("confirmPassword"), "bob");
  expect(screen.getByTestId("error")).toHaveTextContent("not equal");
  await userEvent.clear(screen.getByTestId("password"));
  await userEvent.type(screen.getByTestId("password"), "bob");
  expect(screen.getByTestId("error")).toBeEmptyDOMElement();
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

// Need to figure this out
it("should use the data from the form when validating in DOM mode, but with consideration for controlled fields", async () => {
  const TextComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "",
        bar: "",
      },
      validator: createValidator({
        validate: (data) => {
          const errors: FieldErrors = {};
          if (data.foo.length === 2) errors.foo = "only 2 chars";
          if (data.foo.length === 3) errors.foo = "only 3 chars";
          if (data.foo.length === 4) errors.foo = "only 4 chars";
          if (data.bar.length > 0) errors.bar = "must be empty";
          if (Object.keys(errors).length > 0)
            return Promise.resolve({ error: errors, data: undefined });
          return Promise.resolve({ data, error: undefined });
        },
      }),
      handleSubmit: vi.fn(),
    });

    const controlProps = form.field("foo").getControlProps();

    return (
      <form {...form.getFormProps()}>
        <input
          data-testid="foo"
          ref={controlProps.ref}
          onChange={(e) => controlProps.onChange(e.target.value)}
          onBlur={() => controlProps.onBlur()}
          value={controlProps.value}
        />

        <input
          {...form
            .field("foo")
            .getHiddenInputProps({ serialize: (val) => val + "1" })}
        />
        <div data-testid="error">{form.error("foo")}</div>

        <input name="bar" type="hidden" value="hello" />
        <div data-testid="bar-error">{form.error("bar")}</div>

        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TextComp />);

  await userEvent.click(screen.getByTestId("submit"));
  expect(screen.getByTestId("bar-error")).toHaveTextContent("must be empty");
  expect(screen.getByTestId("error")).toBeEmptyDOMElement();

  await userEvent.type(screen.getByTestId("foo"), "a");
  expect(await screen.findByTestId("error")).toHaveTextContent("only 2 chars");

  await userEvent.type(screen.getByTestId("foo"), "b");
  expect(screen.getByTestId("error")).toHaveTextContent("only 3 chars");

  await userEvent.type(screen.getByTestId("foo"), "c");
  expect(screen.getByTestId("error")).toHaveTextContent("only 4 chars");
});

it("should use the data from the form when validating in DOM mode, but with consideration for controlled fields (no serializer)", async () => {
  const TextComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "",
        bar: "",
      },
      validator: createValidator({
        validate: (data) => {
          const errors: FieldErrors = {};
          if (data.foo.length === 1) errors.foo = "only 1 char";
          if (data.foo.length === 2) errors.foo = "only 2 chars";
          if (data.foo.length === 3) errors.foo = "only 3 chars";
          if (data.bar.length > 0) errors.bar = "must be empty";
          if (Object.keys(errors).length > 0)
            return Promise.resolve({ error: errors, data: undefined });
          return Promise.resolve({ data, error: undefined });
        },
      }),
      handleSubmit: vi.fn(),
    });

    const controlProps = form.field("foo").getControlProps();

    return (
      <form {...form.getFormProps()}>
        <input
          data-testid="foo"
          ref={controlProps.ref}
          onChange={(e) => controlProps.onChange(e.target.value)}
          onBlur={() => controlProps.onBlur()}
          value={controlProps.value}
        />

        <input type="hidden" name="foo" value={controlProps.value} />
        <div data-testid="error">{form.error("foo")}</div>

        <input name="bar" type="hidden" value="hello" />
        <div data-testid="bar-error">{form.error("bar")}</div>

        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TextComp />);

  await userEvent.click(screen.getByTestId("submit"));
  expect(screen.getByTestId("bar-error")).toHaveTextContent("must be empty");
  expect(screen.getByTestId("error")).toBeEmptyDOMElement();

  await userEvent.type(screen.getByTestId("foo"), "a");
  expect(await screen.findByTestId("error")).toHaveTextContent("only 1 char");

  await userEvent.type(screen.getByTestId("foo"), "b");
  expect(screen.getByTestId("error")).toHaveTextContent("only 2 chars");

  await userEvent.type(screen.getByTestId("foo"), "c");
  expect(screen.getByTestId("error")).toHaveTextContent("only 3 chars");
});
