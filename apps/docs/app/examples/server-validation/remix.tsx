import { Button } from "~/ui/button";
import { withZod } from "@rvf/zod";
import { z } from "zod";
import type { ActionFunctionArgs } from "react-router";
import {
  validationError,
  useForm,
  isValidationErrorResponse,
} from "@rvf/react-router";
import { useActionData } from "react-router";
import { MyInput } from "~/fields/MyInput";
import { Note } from "~/ui/mdx/mdx";

const validator = withZod(
  z.object({
    firstName: z
      .string()
      .min(1, { message: "First name is required" }),
    lastName: z
      .string()
      .min(1, { message: "Last name is required" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email("Must be a valid email"),
  }),
);

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const result = await validator.validate(
    await request.formData(),
  );
  if (result.error)
    return validationError(
      result.error,
      result.submittedData,
    );
  return {
    message: `Submitted for ${result.data.firstName} ${result.data.lastName}!`,
  };
};

export const ServerValidationForm = () => {
  const data = useActionData<typeof action>();
  const form = useForm({
    method: "post",
    validator,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  return (
    <form {...form.getFormProps()}>
      <h3>Create an account</h3>

      <MyInput
        scope={form.scope("firstName")}
        label="First name"
      />
      <MyInput
        scope={form.scope("lastName")}
        label="Last name"
      />
      <MyInput scope={form.scope("email")} label="Email" />

      {data && !isValidationErrorResponse(data) && (
        <Note>{data.message}</Note>
      )}

      <Button
        type="submit"
        isLoading={form.formState.isSubmitting}
      >
        Submit
      </Button>
    </form>
  );
};
