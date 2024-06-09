import { DataFunctionArgs, json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { withYup } from "@rvf/yup";
import { FormProvider, useForm, validationError } from "@rvf/remix";
import * as yup from "yup";
import { Input } from "~/components/Input";

const schema = yup.object({
  name: yup.string().required(),
});
const validator = withYup(schema);

export const action = async ({ request }: DataFunctionArgs) => {
  const result = await validator.validate(await request.formData());
  if (result.error)
    return validationError({ fieldErrors: { name: "Submitted invalid form" } });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  return json({ message: `Submitted by ${result.data.name}` });
};

export default function FrontendValidation() {
  const rvf = useForm({
    validator,
    method: "post",
    formId: "test-form",
  });
  const data = useActionData<typeof action>();

  return (
    <FormProvider scope={rvf.scope()}>
      {data && "message" in data && <h1>{data.message}</h1>}
      <form {...rvf.getFormProps()}>
        <Input name="name" label="Name" />
        <button
          type="button"
          onClick={() => {
            rvf.submit();
          }}
        >
          Submit with helper
        </button>
      </form>
    </FormProvider>
  );
}
