import { withZod } from "@remix-validated-form/with-zod";
import { ActionFunction, json, useActionData } from "remix";
import { ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  z
    .object({
      testInput: z.string(),
      dependentInput: z.string(),
    })
    .superRefine((value, ctx) => {
      if (value.dependentInput !== value.testInput) {
        ctx.addIssue({
          code: "custom",
          path: ["dependentInput"],
          message: "Not a match",
        });
      }
    })
);

export const action: ActionFunction = () => json({ message: "Success" });

export default function FrontendValidation() {
  const data = useActionData();

  return (
    <ValidatedForm validator={validator} method="patch">
      {data?.message && <p>{data.message}</p>}
      <Input name="testInput" label="Test input" />
      <Input name="dependentInput" label="Dependent input" />
      <SubmitButton />
    </ValidatedForm>
  );
}
