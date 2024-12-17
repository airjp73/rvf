import { ActionFunctionArgs, useActionData } from "react-router";
import { withZod } from "@rvf/zod";
import { validationError, useForm, FormProvider } from "@rvf/react-router";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";
import { Textarea } from "~/components/Textarea";
import { unstable_useNativeValidityForForm } from "@rvf/react";

const validator = withZod(
  zfd.formData({
    firstName: zfd.text(
      z.string({
        required_error: "First Name is a required field",
      }),
    ),
    lastName: zfd.text(
      z.string({
        required_error: "Last Name is a required field",
      }),
    ),
    email: zfd.text(
      z
        .string({
          required_error: "Email is a required field",
        })
        .email({
          message: "Email must be a valid email",
        }),
    ),
    contacts: z.array(
      z.object({
        name: zfd.text(
          z.string({
            required_error: "Name of a contact is a required field",
          }),
        ),
      }),
    ),
    likesPizza: zfd.checkbox(),
    comment: zfd.text(
      z.string({
        required_error: "Comment is a required field",
      }),
    ),
  }),
);

export const action = async ({ request }: ActionFunctionArgs) => {
  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error, result.submittedData);
  const { firstName, lastName } = result.data;

  return { message: `Submitted for ${firstName} ${lastName}!` };
};

export default function FrontendValidation() {
  const actionData = useActionData<typeof action>();
  const form = useForm({
    id: "test-form",
    defaultValues: { firstName: "" },
    validator,
    method: "post",
  });
  unstable_useNativeValidityForForm(form.scope());

  return (
    <FormProvider scope={form.scope()}>
      <Input hideErrors name={form.scope("firstName")} label="First Name" />
      <form {...form.getFormProps()}>
        {form.renderFormIdInput()}
        {actionData && "message" in actionData && <h1>{actionData.message}</h1>}
        <Input hideErrors name="lastName" label="Last Name" />
        <Input hideErrors name="email" label="Email" />
        <Input hideErrors name="contacts[0].name" label="Name of a contact" />
        <Input
          hideErrors
          name="likesPizza"
          type="checkbox"
          label="Likes pizza"
        />
        <Textarea hideErrors name="comment" label="Comment" />
        <SubmitButton />
        <button type="reset">Reset</button>
      </form>
    </FormProvider>
  );
}
