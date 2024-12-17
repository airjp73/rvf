import { DataFunctionArgs, json } from "react-router";
import { useActionData } from "react-router";
import { withZod } from "@rvf/zod";
import {
  FormProvider,
  useForm,
  validationError,
} from "../../../../packages/react-router/dist";
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
  const rvf = useForm({
    validator,
    method: "post",
    id: "test-form",
  });
  const data = useActionData<typeof action>();
  return (
    <FormProvider scope={rvf.scope()}>
      <form {...rvf.getFormProps()}>
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
          disabled={rvf.formState.isSubmitting}
        />
        <SubmitButton label="Submit" submittingLabel="Submitting..." />
      </form>
    </FormProvider>
  );
}
