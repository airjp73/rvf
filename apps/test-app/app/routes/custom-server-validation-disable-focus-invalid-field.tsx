import { DataFunctionArgs } from "@remix-run/node";
import { withYup } from "@rvf/yup";
import {
  validationError,
  ValidatedForm,
  useServerValidationErrors,
} from "@rvf/remix";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({
  firstName: yup.string(),
  lastName: yup.string(),
});

const validator = withYup(schema);

export const action = async (args: DataFunctionArgs) => {
  return validationError(
    {
      fieldErrors: { firstName: "Error" },
      formId: "test-form",
    },
    { firstName: "Bob", lastName: "Ross" },
  );
};

export default function CustomServerValidationDisableFocusInvalidField() {
  const response = useServerValidationErrors({
    formId: "test-form",
    defaultValues: {},
  });
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      {...response.getFormOpts()}
      disableFocusOnError={true}
    >
      {response.renderHiddenInput()}
      <Input name="firstName" label="First Name" />
      <Input name="lastName" label="Last Name" />
      <SubmitButton />
    </ValidatedForm>
  );
}
