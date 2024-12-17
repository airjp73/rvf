import { Link } from "react-router";
import { withZod } from "@rvf/zod";
import { ValidatedForm } from "@rvf/react-router";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";
import { Route } from "./+types/form-id-validation._index";

const validator = withZod(
  z.object({
    testing: zfd.text(),
  }),
);

export const action = async ({ request }: Route.ActionArgs) => {
  const result = await validator.validate(await request.formData());
  return { message: `Form has id: ${result.formId}` };
};

export default function FormId() {
  return (
    <ValidatedForm validator={validator} method="post" id="form-id-test-form">
      <Link to="/form-id-validation/other">Other</Link>
      <Input name="testing" label="Test input" />
      <SubmitButton />
    </ValidatedForm>
  );
}
