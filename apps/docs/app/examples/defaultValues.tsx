import { useActionData } from "@remix-run/react";
import { withZod } from "@rvf/zod";
import { ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import { Alert } from "~/components/Alert";
import { FormInput } from "~/components/FormInput";
import { SubmitButton } from "~/components/SubmitButton";

export const validator = withZod(
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

export default function Demo() {
  const data = useActionData();
  return (
    <ValidatedForm
      validator={validator}
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
