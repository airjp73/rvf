import { DataFunctionArgs } from "@remix-run/node";
import { withYup } from "@rvf/yup";
import {
  validationError,
  RvfProvider,
  useRvf,
  useRemixFormResponse,
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
  const response = useRemixFormResponse({
    formId: "test-form",
  });
  const form = useRvf({
    ...response.getRvfOpts(),
    validator,
    method: "post",
  });
  return (
    <RvfProvider scope={form.scope()}>
      <Input name="firstName" label="First Name" form="test-form" />
      <form {...form.getFormProps()}>
        <Input name="lastName" label="Last Name" />
        <SubmitButton />
      </form>
    </RvfProvider>
  );
}
