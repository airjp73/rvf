import { withYup } from "@remix-validated-form/with-yup";
import { useFormContext, ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";

const schema = yup.object({
  name: yup.string().required(),
});
const validator = withYup(schema);

export default function FrontendValidation() {
  const { submit } = useFormContext("test-form");
  return (
    <>
      <ValidatedForm
        validator={validator}
        method="post"
        id="test-form"
        action="/submission/helper-with-action/action"
      >
        <Input name="name" label="Name" />
        <button
          type="button"
          onClick={() => {
            submit();
          }}
        >
          Submit with helper
        </button>
      </ValidatedForm>
    </>
  );
}
