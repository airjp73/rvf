import { DataFunctionArgs, redirect } from "@remix-run/server-runtime";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import { SubmitButton } from "~/components/SubmitButton";

const schema = z.object({});
const validator = withZod(schema);

export const action = async (args: DataFunctionArgs) => {
  return redirect("/reload-document-test.html");
};

export default function SubmissionReloadDocument() {
  return (
    <>
      <ValidatedForm validator={validator} method="post" reloadDocument>
        <SubmitButton label="Submit reloadDocument form" />
      </ValidatedForm>

      <ValidatedForm validator={validator} method="post">
        <SubmitButton label="Submit standard form" />
      </ValidatedForm>
    </>
  );
}
