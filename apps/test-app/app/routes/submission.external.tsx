import { useActionData } from "react-router";
import { withZod } from "@rvf/zod";
import { FormProvider, useForm } from "@rvf/react-router";
import { z } from "zod";
import { InputWithTouched } from "~/components/InputWithTouched";
import { SubmitButton } from "~/components/SubmitButton";
import { Route } from "./+types/submission.external";

const validator = withZod(
  z.object({
    mySubmit: z.string(),
  }),
);

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.formData();
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { message: `Submitted ${data.get("mySubmit")}` };
};

export default function FrontendValidation({
  actionData,
}: Route.ComponentProps) {
  const rvf = useForm({
    validator,
    method: "post",
    submitSource: "dom",
  });

  return (
    <>
      {actionData?.message && <h1>{actionData.message}</h1>}
      <SubmitButton form={rvf.scope()} name="mySubmit" value="submitVal" />
      <FormProvider scope={rvf.scope()}>
        <form {...rvf.getFormProps()}>
          <InputWithTouched name="firstName" label="First Name" />
          <InputWithTouched name="lastName" label="Last Name" />
          <SubmitButton
            name="mySubmit"
            value="internalVal"
            label="Submit 2"
            submittingLabel="Submitting 2"
          />
        </form>
      </FormProvider>
    </>
  );
}
