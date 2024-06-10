import { DataFunctionArgs } from "@remix-run/node";
import { withYup } from "@rvf/yup";
import {
  validationError,
  FormProvider,
  useForm,
  useServerValidationErrors,
} from "@rvf/remix";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({});

const validator = withYup(schema);

export const action = async (args: DataFunctionArgs) => {
  return validationError(
    {
      fieldErrors: { firstName: "Error", lastName: "Error 2" },
      formId: "test-form",
    },
    { firstName: "Bob", lastName: "Ross" },
  );
};

export default function CustomServerValidation() {
  const response = useServerValidationErrors("test-form");
  const form = useForm({
    ...response.getFormOpts(),
    validator,
    method: "post",
  });
  return (
    <FormProvider scope={form.scope()}>
      {response.renderHiddenInput()}
      <Input name="firstName" label="First Name" form="test-form" />
      <form {...form.getFormProps()}>
        <Input name="lastName" label="Last Name" />
        <SubmitButton />
      </form>
    </FormProvider>
  );
}
