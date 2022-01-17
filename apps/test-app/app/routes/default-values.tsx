import { withYup } from "@remix-validated-form/with-yup";
import { LoaderFunction, useLoaderData } from "remix";
import { ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({});
const validator = withYup(schema);

export const loader: LoaderFunction = () => {
  return {
    defaultValues: {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
    },
  };
};

export default function DefaultValues() {
  const { defaultValues } = useLoaderData();
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      defaultValues={defaultValues}
    >
      <Input name="firstName" label="First Name" />
      <Input name="lastName" label="Last Name" />
      <Input name="email" label="Email" />
      <SubmitButton />
    </ValidatedForm>
  );
}
