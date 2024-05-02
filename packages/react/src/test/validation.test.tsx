import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRvf } from "../react";
import userEvent from "@testing-library/user-event";
import { RenderCounter } from "./util/RenderCounter";
import { FieldErrors } from "@rvf/core";

it("should validate on submit, then on change after that", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "",
        baz: { a: "" },
      },
      validator: (data) => {
        const errors: FieldErrors = {};
        if (data.foo.length < 3) errors.foo = "too short";
        if (data.baz.a.length > 3) errors["baz.a"] = "too long";
        if (Object.keys(errors).length > 0)
          return Promise.resolve({ data: undefined, error: errors });
        return Promise.resolve({ data, error: undefined });
      },
      onSubmit: submit,
    });

    return (
      <form onSubmit={form.handleSubmit} data-testid="form">
        <input data-testid="foo" {...form.field("foo")} />
        <pre data-testid="foo-error">{form.error("foo")}</pre>

        <input data-testid="baz.a" {...form.field("baz.a")} />
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
  expect(submit).toHaveBeenCalledWith({
    foo: "bob",
    baz: { a: "tes" },
  });

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
      validator: (data) => {
        if (data.password !== data.confirmPassword)
          return Promise.resolve({
            data: undefined,
            error: { confirmPassword: "not equal" },
          });
        return Promise.resolve({ data, error: undefined });
      },
      onSubmit: submit,
    });

    return (
      <form onSubmit={form.handleSubmit} data-testid="form">
        <input data-testid="password" {...form.field("password")} />
        <input
          data-testid="confirmPassword"
          {...form.field("confirmPassword")}
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
  expect(submit).toHaveBeenCalledWith({
    password: "test",
    confirmPassword: "test",
  });
});

it("should be possible to customize validation behavior", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "",
      },
      validator: (data) => {
        const errors: FieldErrors = {};
        if (data.foo.length < 3) errors.foo = "too short";
        if (Object.keys(errors).length > 0)
          return Promise.resolve({ data: undefined, error: errors });
        return Promise.resolve({ data, error: undefined });
      },
      onSubmit: submit,
      validationBehaviorConfig: {
        initial: "onBlur",
        whenTouched: "onChange",
        whenSubmitted: "onChange",
      },
    });

    return (
      <form onSubmit={form.handleSubmit} data-testid="form">
        <input data-testid="foo" {...form.field("foo")} />
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
  };

  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "",
      },
      validator: (data) => {
        const errors: FieldErrors = {};
        if (data.foo.length < 3) errors.foo = "too short";
        if (Object.keys(errors).length > 0)
          return Promise.resolve({ data: undefined, error: errors });
        return Promise.resolve({ data, error: undefined });
      },
      onSubmit: submit,
    });

    return (
      <form onSubmit={form.handleSubmit} data-testid="form">
        <input
          data-testid="foo"
          {...form.field("foo", { validationBehavior: behaviorConfig })}
        />
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
// it("should use validation adapters", async () => {
//   const submit = vi.fn();
//   const TestComp = () => {
//     const form = useRvf({
//       defaultValues: {
//         foo: "",
//         bar: { a: "" },
//       },
//       validator: withZod(
//         z.object({
//           foo: z.string().min(3, "too short"),
//           bar: z.object({
//             a: z.string().min(3, "too short"),
//           }),
//         }),
//       ),
//       onSubmit: submit,
//       validationBehaviorConfig: {
//         initial: "onChange",
//         whenTouched: "onChange",
//         whenSubmitted: "onChange",
//       },
//     });

//     return (
//       <form onSubmit={form.handleSubmit} data-testid="form">
//         <input data-testid="foo" {...form.field("foo")} />
//         <pre data-testid="foo-error">{form.error("foo")}</pre>

//         <input data-testid="bar.a" {...form.field("bar.a")} />
//         <pre data-testid="bar.a-error">{form.error("bar.a")}</pre>
//       </form>
//     );
//   };

//   render(<TestComp />);

//   await userEvent.type(screen.getByTestId("foo"), "12");
//   expect(screen.getByTestId("foo-error")).toHaveTextContent("too short");
//   await userEvent.type(screen.getByTestId("foo"), "12");
//   expect(screen.getByTestId("foo-error")).toBeEmptyDOMElement();
//   await userEvent.type(screen.getByTestId("foo"), "{Backspace}{Backspace}");
//   expect(screen.getByTestId("foo-error")).toHaveTextContent("too short");

//   await userEvent.type(screen.getByTestId("bar.a"), "12");
//   expect(screen.getByTestId("bar.a-error")).toHaveTextContent("too short");
//   await userEvent.type(screen.getByTestId("bar.a"), "12");
//   expect(screen.getByTestId("bar.a-error")).toBeEmptyDOMElement();
//   await userEvent.type(screen.getByTestId("bar.a"), "{Backspace}{Backspace}");
//   expect(screen.getByTestId("bar.a-error")).toHaveTextContent("too short");
// });
