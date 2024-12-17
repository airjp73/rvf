import { DataFunctionArgs } from "react-router";
import { withYup } from "@rvf/yup";
import {
  validationError,
  FormProvider,
  useForm,
} from "../../../../packages/react-router/dist";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({});

const validator = withYup(schema);

export const action = async (args: DataFunctionArgs) => {
  return validationError(
    {
      fieldErrors: { firstName: "Error", lastName: "Error 2" },
    },
    { firstName: "Bob", lastName: "Ross" },
  );
};

export default function CustomServerValidation() {
  const form = useForm({
    validator,
    method: "post",
  });
  return (
    <FormProvider scope={form.scope()}>
      <Input name="firstName" label="First Name" form="test-form" />
      <form {...form.getFormProps()}>
        <Input name="lastName" label="Last Name" />
        <SubmitButton />
      </form>
    </FormProvider>
  );
}
