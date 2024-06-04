import { useActionData } from "@remix-run/react";
import { createRemixStub } from "@remix-run/testing";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createValidator } from "@rvf/core";
import { useRvf } from "../useRvf";
import { isValidationErrorResponse, validationError } from "../server";
import {
  ActionFunctionArgs,
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";

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
