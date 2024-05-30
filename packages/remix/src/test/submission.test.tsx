import { useActionData, useLoaderData } from "@remix-run/react";
import { createRemixStub } from "@remix-run/testing";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createValidator } from "@rvf/core";
import { useRvf } from "../useRvf";
import { isValidationErrorResponse, validationError } from "../server";
import { ActionFunctionArgs } from "@remix-run/server-runtime";

it("should submit data to the action", async () => {
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

it.todo("should be able to submit state directly");
