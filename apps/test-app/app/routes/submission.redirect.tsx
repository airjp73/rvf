import { DataFunctionArgs, redirect } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(z.object({}));

export const action = async (args: DataFunctionArgs) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return redirect("/submission/redirect/to");
};

export default function FrontendValidation() {
  return (
    <>
      <ValidatedForm validator={validator} method="post" id="test-form">
        <SubmitButton />
      </ValidatedForm>
    </>
  );
}
