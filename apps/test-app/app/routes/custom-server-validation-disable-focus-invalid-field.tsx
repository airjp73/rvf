import { DataFunctionArgs } from "react-router";
import { withYup } from "@rvf/yup";
import { validationError, ValidatedForm } from "@rvf/remix";
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
    },
    { firstName: "Bob", lastName: "Ross" },
  );
};

export default function CustomServerValidationDisableFocusInvalidField() {
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      disableFocusOnError={true}
    >
      <Input name="firstName" label="First Name" />
      <Input name="lastName" label="Last Name" />
      <SubmitButton />
    </ValidatedForm>
  );
}
