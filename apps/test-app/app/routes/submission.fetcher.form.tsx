import { useFetcher } from "react-router";
import { ValidatedForm } from "@rvf/react-router";
import { withYup } from "@rvf/yup";
import * as yup from "yup";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({});
const validator = withYup(schema);

export default function FrontendValidation() {
  const fetcher =
    useFetcher<(typeof import("./submission.fetcher.action"))["action"]>();
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      action="/submission/fetcher/action"
      fetcher={fetcher}
    >
      {fetcher.data?.done && <p>{fetcher.data?.done}</p>}
      <SubmitButton
        label="Submit fetcher form"
        submittingLabel="Submitting fetcher form"
      />
    </ValidatedForm>
  );
}
