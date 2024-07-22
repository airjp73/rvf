import { json, redirect, useActionData, useFetcher } from "@remix-run/react";
import { createRemixStub } from "@remix-run/testing";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createValidator,
  FORM_ID_FIELD_NAME,
  isValidationErrorResponse,
} from "@rvf/core";
import { useForm } from "../useForm";
import { validationError } from "../server";
import { ActionFunctionArgs } from "@remix-run/node";
import { ValidatedForm } from "../ValidatedForm";

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

it("should respect the validation errors returned from the action", async () => {
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });

  const action = async ({ request }: ActionFunctionArgs) => {
    return validationError({
      fieldErrors: { foo: "validation error" },
    });
  };

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        const form = useForm({
          defaultValues: { foo: "" },
          validator,
          method: "post",
        });
        return (
          <form {...form.getFormProps()}>
            <input data-testid="foo" {...form.getInputProps("foo")} />
            {form.error("foo") && (
              <pre data-testid="foo-error">{form.error("foo")}</pre>
            )}
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

  expect(await screen.findByTestId("foo-error")).toHaveTextContent(
    "validation error",
  );
});

it("should not show the validation errors if a form id is returned from the action, but not provided to the form", async () => {
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });

  const action = async ({ request }: ActionFunctionArgs) => {
    return validationError({
      fieldErrors: { foo: "validation error" },
      formId: "testing",
    });
  };

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        const data = useActionData<typeof action>();
        const form = useForm({
          defaultValues: { foo: "" },
          validator,
          method: "post",
        });
        return (
          <form {...form.getFormProps()}>
            {!!data && <p>Done</p>}
            <input data-testid="foo" {...form.getInputProps("foo")} />
            {form.error("foo") && (
              <pre data-testid="foo-error">{form.error("foo")}</pre>
            )}
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
  expect(await screen.findByText("Done")).toBeInTheDocument();
  expect(screen.queryByTestId("foo-error")).not.toBeInTheDocument();
});

it("should show the validation errors if a form id is returned from the action, and it is provided to the form", async () => {
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });

  const action = async ({ request }: ActionFunctionArgs) => {
    return validationError({
      fieldErrors: { foo: "validation error" },
      formId: "testing",
    });
  };

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        const data = useActionData<typeof action>();
        const form = useForm({
          defaultValues: { foo: "" },
          validator,
          method: "post",
          id: "testing",
        });
        return (
          <form {...form.getFormProps()}>
            {!!data && <p>Done</p>}
            <input data-testid="foo" {...form.getInputProps("foo")} />
            {form.error("foo") && (
              <pre data-testid="foo-error">{form.error("foo")}</pre>
            )}
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
  expect(await screen.findByTestId("foo-error")).toHaveTextContent(
    "validation error",
  );
});

it("should not show the validation errors if no form id is returned from the action, but one is provided to the form", async () => {
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });

  const action = async ({ request }: ActionFunctionArgs) => {
    return validationError({
      fieldErrors: { foo: "validation error" },
    });
  };

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        const data = useActionData<typeof action>();
        const form = useForm({
          defaultValues: { foo: "" },
          validator,
          method: "post",
          id: "testing",
        });
        return (
          <form {...form.getFormProps()}>
            {!!data && <p>Done</p>}
            <input data-testid="foo" {...form.getInputProps("foo")} />
            {form.error("foo") && (
              <pre data-testid="foo-error">{form.error("foo")}</pre>
            )}
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
  expect(await screen.findByText("Done")).toBeInTheDocument();
  expect(screen.queryByTestId("foo-error")).not.toBeInTheDocument();
});

it("should automatically take care of the form id for server validation errors", async () => {
  const validator = createValidator({
    validate: () =>
      Promise.resolve({
        data: undefined,
        error: { foo: "validation error" },
      }),
  });

  const action = async ({ request }: ActionFunctionArgs) => {
    const data = await validator.validate(await request.formData());
    if (data.error) return validationError(data.error);
    return {};
  };

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        const form = useForm({
          defaultValues: { foo: "" },
          validator,
          method: "post",
          id: "testing",
        });
        return (
          <form {...form.getFormProps()}>
            {form.renderFormIdInput()}

            <input data-testid="foo" {...form.getInputProps("foo")} />
            {form.error("foo") && (
              <pre data-testid="foo-error">{form.error("foo")}</pre>
            )}
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

  expect(await screen.findByTestId("foo-error")).toHaveTextContent(
    "validation error",
  );
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

it("should have access to the latest action data in onSubmitSuccess", async () => {
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
        const data = useActionData<typeof action>();
        const form = useForm({
          defaultValues: { foo: "" },
          validator,
          method: "post",
          onSubmitSuccess: () => {
            success(data);
          },
        });
        return (
          <form {...form.getFormProps()}>
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

  await waitFor(() => {
    expect(success).toHaveBeenCalledTimes(1);
  });
  expect(success).toHaveBeenCalledWith({ message: "You said: bar" });
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
        const form = useForm({
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
          defaultValues: { foo: "", bar: "" },
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
            <input data-testid="bar" name="bar" />
            <button type="submit" data-testid="submit" />
          </form>
        );
      },
      action,
    },
  ]);

  render(<Stub />);

  await userEvent.type(screen.getByTestId("foo"), "foo");
  expect(screen.getByTestId("foo")).toHaveValue("foo");

  await userEvent.type(screen.getByTestId("bar"), "bar");
  expect(screen.getByTestId("bar")).toHaveValue("bar");

  await userEvent.click(screen.getByTestId("submit"));

  expect(await screen.findByText("You said: foo")).toBeInTheDocument();
  expect(screen.getByTestId("foo")).toHaveValue("");
  expect(screen.getByTestId("bar")).toHaveValue("");
});

it("should set the rvfFormId prop on submit", async () => {
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });

  const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const data = await validator.validate(formData);
    if (data.error) return validationError(data.error);
    return { formId: formData.get(FORM_ID_FIELD_NAME) as string };
  };

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        const fetcher = useFetcher<typeof action>();
        const form = useForm({
          fetcher,
          defaultValues: { foo: "", bar: "" },
          id: "form-id-value",
          validator,
          method: "post",
          submitSource: "state",
        });
        return (
          <form {...form.getFormProps()}>
            {fetcher.data && !isValidationErrorResponse(fetcher.data) && (
              <p>{fetcher.data.formId}</p>
            )}
            <input data-testid="foo" {...form.field("foo").getInputProps()} />
            <input data-testid="bar" name="bar" />
            <button type="submit" data-testid="submit" />
          </form>
        );
      },
      action,
    },
  ]);

  render(<Stub />);

  await userEvent.type(screen.getByTestId("foo"), "foo");
  await userEvent.type(screen.getByTestId("bar"), "bar");
  await userEvent.click(screen.getByTestId("submit"));

  expect(await screen.findByText("form-id-value")).toBeInTheDocument();
});
