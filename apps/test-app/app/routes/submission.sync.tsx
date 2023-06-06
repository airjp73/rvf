import { DataFunctionArgs, json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import {
  ValidatedForm,
  useIsSubmitting,
  validationError,
} from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = z.object({
  willBeChanged: zfd.text().refine(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return true;
  }),
  willBeDisabled: zfd.text(z.string().optional()),
});
const validator = withZod(schema);

export const action = async (args: DataFunctionArgs) => {
  const result = await validator.validate(await args.request.formData());
  if (result.error) return validationError(result.error);
  return json({ data: result.data });
};

export default function FrontendValidation() {
  const isSubmitting = useIsSubmitting("test-form");
  const data = useActionData<typeof action>();
  return (
    <ValidatedForm validator={validator} id="test-form" method="post">
      {data && "data" in data && (
        <>
          <p data-testid="willBeChangedResult">{data.data.willBeChanged}</p>
          <p data-testid="willBeDisabledResult">{data.data.willBeDisabled}</p>
        </>
      )}
      <Input label="Will be changed" name="willBeChanged" />
      <Input
        label="Will be disabled"
        name="willBeDisabled"
        disabled={isSubmitting}
      />
      <SubmitButton label="Submit" submittingLabel="Submitting..." />
    </ValidatedForm>
  );
}
