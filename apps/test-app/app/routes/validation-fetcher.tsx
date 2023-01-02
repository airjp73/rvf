import { DataFunctionArgs, json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { withYup } from "@remix-validated-form/with-yup";
import { validationError, ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({
  firstName: yup.string().label("First Name").required(),
  lastName: yup.string().label("Last Name").required(),
  email: yup.string().label("Email").email().required(),
});

const validator = withYup(schema);

export const action = async ({ request }: DataFunctionArgs) => {
  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error);
  const { firstName, lastName } = result.data;

  return json({ message: `Submitted for ${firstName} ${lastName}!` });
};

export default function FrontendValidation() {
  const fetcher = useFetcher();
  return (
    <>
      {fetcher.data?.message && <h1>{fetcher.data.message}</h1>}
      <Input name="firstName" label="First Name" form="test-form" />
      <ValidatedForm
        validator={validator}
        method="post"
        fetcher={fetcher as any}
        id="test-form"
      >
        <Input name="lastName" label="Last Name" />
        <Input name="email" label="Email" />
        <SubmitButton />
      </ValidatedForm>
    </>
  );
}
