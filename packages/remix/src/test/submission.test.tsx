import { json, redirect, useActionData } from "@remix-run/react";
import { createRemixStub } from "@remix-run/testing";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createValidator } from "@rvf/core";
import { useRvf } from "../useRvf";
import { isValidationErrorResponse, validationError } from "../server";
import { ActionFunctionArgs } from "@remix-run/node";

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
        const form = useRvf({
          defaultValues: { foo: "" },
          validator,
          method: "post",
        });
        return (
          <form {...form.getFormProps()}>
            {result && !isValidationErrorResponse(result) && (
              <p>{result.message}</p>
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
        const form = useRvf({
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
        const form = useRvf({
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
        const form = useRvf({
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

it("should correctly strip down fully qualified urls", async () => {
  const validator = createValidator({
    validate: (data) => Promise.resolve({ data, error: undefined }),
  });
  const a = vi.fn();

  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => {
        const form = useRvf({
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
