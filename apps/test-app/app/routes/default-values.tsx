import { withZod } from "@remix-validated-form/with-zod";
import { json, LoaderFunction, useLoaderData } from "remix";
import { ValidatedForm, ValidatorData } from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  z.object({
    firstName: zfd.text(),
    lastName: zfd.text(),
    email: zfd.text(z.string().email()),
    age: zfd.numeric(),
  })
);

type LoaderData = {
  defaultValues: ValidatorData<typeof validator>;
};

export const loader: LoaderFunction = () => {
  return json<LoaderData>({
    defaultValues: {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      age: 26,
    },
  });
};

export default function DefaultValues() {
  const { defaultValues } = useLoaderData<LoaderData>();
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      defaultValues={defaultValues}
    >
      <Input name="firstName" label="First Name" />
      <Input name="lastName" label="Last Name" />
      <Input name="email" label="Email" />
      <Input name="age" type="number" label="Age" />
      <SubmitButton />
    </ValidatedForm>
  );
}
