import { withZod } from "@remix-validated-form/with-zod";
import { useActionData } from "remix";
import { ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import { Alert } from "~/components/Alert";
import { FormInput } from "~/components/FormInput";
import { SubmitButton } from "~/components/SubmitButton";

export const validator = withZod(
  z.object({
    firstName: z
      .string()
      .nonempty("First name is required"),
    lastName: z.string().nonempty("Last name is required"),
    email: z
      .string()
      .nonempty("Email is required")
      .email("Must be a valid email"),
  })
);

export default function Demo() {
  const data = useActionData();
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      defaultValues={{
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
      }}
    >
      <FormInput name="firstName" label="First Name" />
      <FormInput name="lastName" label="Last Name" />
      <FormInput name="email" label="Email" />
      {data && (
        <Alert
          variant="info"
          title={data.title}
          details={data.description}
        />
      )}
      <SubmitButton />
    </ValidatedForm>
  );
}
