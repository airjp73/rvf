import { DataFunctionArgs, json } from "@remix-run/node";
import { withZod } from "@rvf/zod";
import { ValidatedForm, validationError, useField } from "@rvf/remix";
import { z } from "zod";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  z.object({
    testinput: z.literal("success"),
  }),
);

export const action = async ({ request }: DataFunctionArgs) => {
  const formData = await request.formData();

  // Perform this check without the validator
  // because the validator would stop the submission on the frontend
  const testinput = formData.get("testinput");
  if (testinput === "fail")
    return validationError({
      fieldErrors: {
        testinput: "Don't say that",
      },
    });

  return json({ message: "Submitted!" });
};

const CustomInput = () => {
  const { getInputProps, error } = useField("testinput", {
    validationBehavior: {
      initial: "onSubmit",
      whenTouched: "onSubmit",
      whenSubmitted: "onChange",
    },
  });

  return (
    <div>
      <label htmlFor="testinput">Test input</label>
      <input {...getInputProps({ id: "testinput" })} />
      {error && <span style={{ color: "red" }}>{error}</span>}
    </div>
  );
};

export default function FrontendValidation() {
  return (
    <ValidatedForm validator={validator} method="post" resetAfterSubmit>
      <CustomInput />
      <SubmitButton label="Submit" submittingLabel="Submitting" />
    </ValidatedForm>
  );
}
