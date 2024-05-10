import { withYup } from "@rvf/yup";
import { ValidatedForm } from "@rvf/remix";
import * as yup from "yup";
import { InputWithTouched } from "~/components/InputWithTouched";

const schema = yup.object({
  firstName: yup.string(),
  lastName: yup.string(),
});

const validator = withYup(schema);

export default function FrontendValidation() {
  return (
    <ValidatedForm validator={validator} method="post">
      <InputWithTouched name="firstName" label="First Name" />
      <InputWithTouched name="lastName" label="Last Name" />
      <button type="reset">Reset</button>
    </ValidatedForm>
  );
}
