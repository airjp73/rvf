import { useFetcher } from "@remix-run/react";
import { withYup } from "@remix-validated-form/with-yup";
import { ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({});
const validator = withYup(schema);

export default function FrontendValidation() {
  const fetcher = useFetcher();
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      action="/submission/fetcher"
      fetcher={fetcher as any}
    >
      {fetcher.data?.done && <p>{fetcher.data?.done}</p>}
      <SubmitButton
        label="Submit fetcher form"
        submittingLabel="Submitting fetcher form"
      />
    </ValidatedForm>
  );
}
