import { redirect } from "react-router";
import { withZod } from "@rvf/zod";
import { ValidatedForm } from "@rvf/remix";
import { z } from "zod";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(z.object({}));

export const action = async () => {
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
