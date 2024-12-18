import { useActionData } from "react-router";
import { withZod } from "@rvf/zod";
import { ValidatedForm } from "@rvf/react-router";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  z.object({
    shouldPreventDefault: zfd.checkbox(),
  }),
);

export const action = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { message: "Submitted!" };
};

export default function FrontendValidation() {
  const actionData = useActionData<typeof action>();
  return (
    <>
      {actionData?.message && <h1>{actionData.message}</h1>}
      <ValidatedForm
        validator={validator}
        method="post"
        id="test-form"
        onSubmit={(event) => {
          const data = new FormData(event.target as HTMLFormElement);
          if (data.has("shouldPreventDefault")) event.preventDefault();
        }}
      >
        <Input
          name="shouldPreventDefault"
          type="checkbox"
          label="shouldPreventDefault"
        />
        <SubmitButton />
      </ValidatedForm>
    </>
  );
}
