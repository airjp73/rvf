import { json, redirect, useActionData, useFetcher } from "@remix-run/react";
import { createRemixStub } from "@remix-run/testing";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createValidator, isValidationErrorResponse } from "@rvf/core";
import { useForm } from "../useForm";
import { validationError } from "../server";
import { ActionFunctionArgs } from "@remix-run/node";
import { ValidatedForm } from "../ValidatedForm";
import { useRemixFormResponse } from "../auto-server-hooks";

it("should submit data to the action in dom mode", async () => {
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });

  const action = async ({ request }: ActionFunctionArgs) => {
    const data = await validator.validate(await request.formData());
    if (data.error) return validationError(data.error);
    return { message: `You said: ${data.data.foo}` };
  };

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        const result = useActionData<typeof action>();
        const form = useForm({
          defaultValues: { foo: "" },
          validator,
          method: "post",
        });
        return (
          <form {...form.getFormProps()}>
            {result && !isValidationErrorResponse(result) && (
              <p>{result.message}</p>
            )}
            <input data-testid="foo" {...form.getInputProps("foo")} />
            <button type="submit" data-testid="submit" />
          </form>
        );
      },
      action,
    },
  ]);

  render(<Stub />);

  await userEvent.type(screen.getByTestId("foo"), "bar");
  await userEvent.click(screen.getByTestId("submit"));

  expect(await screen.findByText("You said: bar")).toBeInTheDocument();
});

it("should be able to submit state directly", async () => {
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });
  const a = vi.fn();

  const action = async ({ request }: ActionFunctionArgs) => {
    const data = await validator.validate(await request.json());
    if (data.error) return validationError(data.error);
    a(data.data);
    return { message: `You said: ${data.data.foo}` };
  };

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        const result = useActionData<typeof action>();
        const form = useForm({
          submitSource: "state",
          defaultValues: { foo: "", bar: { baz: [123] } },
          validator,
          method: "post",
          encType: "application/json",
        });
        return (
          <form {...form.getFormProps()}>
            {result && !isValidationErrorResponse(result) && (
              <p>{result.message}</p>
            )}
            <input data-testid="foo" {...form.field("foo").getInputProps()} />
            <input
              data-testid="bar"
              {...form.field("bar.baz[0]").getInputProps({ type: "number" })}
            />
            <button type="submit" data-testid="submit" />
          </form>
        );
      },
      action,
    },
  ]);

  render(<Stub />);

  await userEvent.type(screen.getByTestId("foo"), "bar");
  await userEvent.type(screen.getByTestId("bar"), "123");
  await userEvent.click(screen.getByTestId("submit"));

  expect(a).toHaveBeenCalledTimes(1);
  expect(await screen.findByText("You said: bar")).toBeInTheDocument();
  expect(a).toHaveBeenCalledWith({ foo: "bar", bar: { baz: [123123] } });
});

it("should be able to submit state directly as form data", async () => {
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });
  const a = vi.fn();

  const action = async ({ request }: ActionFunctionArgs) => {
    const data = await validator.validate(await request.formData());
    if (data.error) return validationError(data.error);
    a(data.data);
    return { message: `You said: ${data.data.foo}` };
  };

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        const result = useActionData<typeof action>();
        const form = useForm({
          submitSource: "state",
          defaultValues: { foo: "", bar: { baz: [123] } },
          validator,
          method: "post",
        });
        return (
          <form {...form.getFormProps()}>
            {result && !isValidationErrorResponse(result) && (
              <p>{result.message}</p>
            )}
            <input data-testid="foo" {...form.field("foo").getInputProps()} />
            <input
              data-testid="bar"
              {...form.field("bar.baz[0]").getInputProps({ type: "number" })}
            />
            <button type="submit" data-testid="submit" />
          </form>
        );
      },
      action,
    },
  ]);

  render(<Stub />);

  await userEvent.type(screen.getByTestId("foo"), "bar");
  await userEvent.type(screen.getByTestId("bar"), "123");
  await userEvent.click(screen.getByTestId("submit"));

  expect(a).toHaveBeenCalledTimes(1);
  expect(await screen.findByText("You said: bar")).toBeInTheDocument();
  // Because we submitted as form data
  expect(a).toHaveBeenCalledWith({ foo: "bar", bar: { baz: ["123123"] } });
});

it("should respect the formMethod of the submitter", async () => {
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });
  const a = vi.fn();
  const l = vi.fn();

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        const form = useForm({
          validator,
        });
        return (
          <form {...form.getFormProps()}>
            <button
              type="button"
              data-testid="submit-action"
              onClick={() => {
                // jsdom doesn't handle submitters, so we'll do this manually
                form.submit({
                  formMethod: "post",
                  formEnctype: "application/json",
                });
              }}
            />
            <button
              type="button"
              data-testid="submit-loader"
              onClick={() => {
                form.submit({ formMethod: "get" });
              }}
            />
          </form>
        );
      },
      async action({ request }) {
        a();
        await request.json();
        return json({ message: "Action called" });
      },
      async loader() {
        l();
        return json({ message: "Loader called" });
      },
    },
  ]);

  render(<Stub />);

  // This get's called once on linitial load
  l.mockClear();

  await userEvent.click(await screen.findByTestId("submit-loader"));
  expect(l).toHaveBeenCalledTimes(1);
  await userEvent.click(screen.getByTestId("submit-action"));
  expect(a).toHaveBeenCalledTimes(1);
});

it("should respect the specified action", async () => {
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });
  const a = vi.fn();

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        const form = useForm({
          validator,
          method: "post",
          action: "/action",
        });
        return (
          <form {...form.getFormProps()}>
            <button type="submit" data-testid="submit-action" />
          </form>
        );
      },
    },
    {
      path: "/action",
      async action({ request }) {
        a();
        await request.json();
        return redirect("/");
      },
    },
  ]);

  render(<Stub />);

  await userEvent.click(screen.getByTestId("submit-action"));
  expect(a).toHaveBeenCalledTimes(1);
});

it("should respect the specified action with the ValidatedForm component", async () => {
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });
  const a = vi.fn();

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        return (
          <ValidatedForm validator={validator} method="post" action="/action">
            <button type="submit" data-testid="submit-action" />
          </ValidatedForm>
        );
      },
    },
    {
      path: "/action",
      async action({ request }) {
        a();
        await request.json();
        return redirect("/");
      },
    },
  ]);

  render(<Stub />);

  await userEvent.click(screen.getByTestId("submit-action"));
  expect(a).toHaveBeenCalledTimes(1);
});

it("should correctly strip down fully qualified urls", async () => {
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });
  const a = vi.fn();

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        const form = useForm({
          validator,
          method: "post",
        });
        return (
          <form {...form.getFormProps()}>
            <button
              type="button"
              data-testid="submit-action"
              onClick={() => {
                // jsdom doesn't handle submitters, so we'll do this manually
                form.submit({
                  formAction: "https://example.com/action",
                });
              }}
            />
          </form>
        );
      },
    },
    {
      path: "/action",
      async action({ request }) {
        a();
        await request.json();
        return redirect("/");
      },
    },
  ]);

  render(<Stub />);

  await userEvent.click(screen.getByTestId("submit-action"));
  expect(a).toHaveBeenCalledTimes(1);
});

it("should function correctly with nested urls", async () => {
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });
  const a = vi.fn();

  const Stub = createRemixStub([
    {
      path: "/test/action",
      Component: () => {
        const form = useForm({
          validator,
          method: "post",
          action: "/test/action/route",
        });
        return (
          <form {...form.getFormProps()}>
            <button type="submit" data-testid="submit-action" />
          </form>
        );
      },
    },
    {
      path: "/test/action/route",
      async action({ request }) {
        a();
        await request.json();
        return redirect("/");
      },
    },
  ]);

  render(<Stub initialEntries={["/test/action"]} />);

  await userEvent.click(screen.getByTestId("submit-action"));
  expect(a).toHaveBeenCalledTimes(1);
});

it("should correctly handle submitting with a fetcher", async () => {
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });

  const action = async ({ request }: ActionFunctionArgs) => {
    const data = await validator.validate(await request.formData());
    if (data.error) return validationError(data.error);
    return { message: `You said: ${data.data.foo}` };
  };

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        const fetcher = useFetcher<typeof action>();
        const form = useForm({
          fetcher,
          defaultValues: { foo: "" },
          validator,
          method: "post",
        });
        return (
          <form {...form.getFormProps()}>
            {fetcher.data && !isValidationErrorResponse(fetcher.data) && (
              <p>{fetcher.data.message}</p>
            )}
            <input data-testid="foo" {...form.field("foo").getInputProps()} />
            <button type="submit" data-testid="submit" />
          </form>
        );
      },
      action,
    },
  ]);

  render(<Stub />);

  await userEvent.type(screen.getByTestId("foo"), "bar");
  await userEvent.click(screen.getByTestId("submit"));

  expect(await screen.findByText("You said: bar")).toBeInTheDocument();
});

it("should call onSubmitSuccess when the call is complete", async () => {
  const success = vi.fn();
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });

  const action = async ({ request }: ActionFunctionArgs) => {
    const data = await validator.validate(await request.formData());
    if (data.error) return validationError(data.error);
    return { message: `You said: ${data.data.foo}` };
  };

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        const fetcher = useFetcher<typeof action>();
        const form = useForm({
          fetcher,
          defaultValues: { foo: "" },
          validator,
          method: "post",
          onSubmitSuccess: success,
        });
        return (
          <form {...form.getFormProps()}>
            {fetcher.data && !isValidationErrorResponse(fetcher.data) && (
              <p>{fetcher.data.message}</p>
            )}
            <input data-testid="foo" {...form.field("foo").getInputProps()} />
            <button type="submit" data-testid="submit" />
          </form>
        );
      },
      action,
    },
  ]);

  render(<Stub />);

  await userEvent.type(screen.getByTestId("foo"), "bar");
  await userEvent.click(screen.getByTestId("submit"));

  expect(await screen.findByText("You said: bar")).toBeInTheDocument();
  expect(success).toHaveBeenCalledTimes(1);
});

it("should call onSubmitFailure if the call returns a validation error", async () => {
  const success = vi.fn();
  const failure = vi.fn();
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });

  const action = async () => {
    return validationError({
      fieldErrors: { foo: "validation error" },
    });
  };

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        const response = useRemixFormResponse();
        const form = useForm({
          ...response.getFormOpts(),
          defaultValues: { foo: "" },
          validator,
          method: "post",
          onSubmitSuccess: success,
          onSubmitFailure: failure,
        });
        return (
          <form {...form.getFormProps()}>
            <input data-testid="foo" {...form.field("foo").getInputProps()} />
            <pre>{form.error("foo")}</pre>
            <button type="submit" data-testid="submit" />
          </form>
        );
      },
      action,
    },
  ]);

  render(<Stub />);

  await userEvent.type(screen.getByTestId("foo"), "bar");
  await userEvent.click(screen.getByTestId("submit"));

  expect(await screen.findByText("validation error")).toBeInTheDocument();
  expect(success).not.toHaveBeenCalledTimes(1);
  expect(failure).toHaveBeenCalled();
});

it("should reset the form after a successful submission when resetAfterSubmit is true", async () => {
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });

  const action = async ({ request }: ActionFunctionArgs) => {
    const data = await validator.validate(await request.formData());
    if (data.error) return validationError(data.error);
    return { message: `You said: ${data.data.foo}` };
  };

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        const fetcher = useFetcher<typeof action>();
        const form = useForm({
          fetcher,
          defaultValues: { foo: "" },
          validator,
          method: "post",
          resetAfterSubmit: true,
        });
        return (
          <form {...form.getFormProps()}>
            {fetcher.data && !isValidationErrorResponse(fetcher.data) && (
              <p>{fetcher.data.message}</p>
            )}
            <input data-testid="foo" {...form.field("foo").getInputProps()} />
            <button type="submit" data-testid="submit" />
          </form>
        );
      },
      action,
    },
  ]);

  render(<Stub />);

  await userEvent.type(screen.getByTestId("foo"), "bar");
  expect(screen.getByTestId("foo")).toHaveValue("bar");
  await userEvent.click(screen.getByTestId("submit"));

  expect(await screen.findByText("You said: bar")).toBeInTheDocument();
  expect(screen.getByTestId("foo")).toHaveValue("");
});
