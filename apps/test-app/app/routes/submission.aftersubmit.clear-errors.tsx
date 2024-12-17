import { withZod } from "@rvf/zod";
import { ValidatedForm } from "@rvf/react-router";
import { z } from "zod";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";
import { Route } from "./+types/submission.aftersubmit.clear-errors";

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
    }),
);

export const action = (args: Route.ActionArgs) => ({ message: "Success" });

export default function FrontendValidation({
  actionData: data,
}: Route.ComponentProps) {
  return (
    <ValidatedForm validator={validator} method="patch">
      {data?.message && <p>{data.message}</p>}
      <Input name="testInput" label="Test input" />
      <Input name="dependentInput" label="Dependent input" />
      <SubmitButton />
    </ValidatedForm>
  );
}
