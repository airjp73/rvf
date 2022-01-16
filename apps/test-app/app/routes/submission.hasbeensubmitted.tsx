import { withYup } from "@remix-validated-form/with-yup";
import { useFormContext, ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({
  firstName: yup.string().label("First Name").required(),
});

const validator = withYup(schema);

const IsSubmitted = () => {
  const { hasBeenSubmitted } = useFormContext();
  return hasBeenSubmitted ? <h1>Submitted!</h1> : null;
};

export default function FrontendValidation() {
  return (
    <ValidatedForm validator={validator}>
      <Input name="firstName" label="First Name" validateOnBlur />
      <SubmitButton />
      <IsSubmitted />
      <button type="reset">Reset</button>
    </ValidatedForm>
  );
}
