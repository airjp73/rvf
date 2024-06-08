import { withYup } from "@rvf/yup";
import { RvfProvider, ValidatedForm, useRvf, useRvfContext } from "@rvf/remix";
import * as yup from "yup";
import { Input } from "~/components/Input";

const schema = yup.object({
  name: yup.string().required(),
});
const validator = withYup(schema);

export default function FrontendValidation() {
  const rvf = useRvf({
    validator,
    method: "post",
    action: "/submission/helper-with-action/action",
  });
  return (
    <RvfProvider scope={rvf.scope()}>
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
    </RvfProvider>
  );
}