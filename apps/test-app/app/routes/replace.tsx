/**
 * This route doesn't have an integration test because it's tricky
 * to actually write a test for this with cypress.
 * It's left here form manual testing.
 */
import { withYup } from "@remix-validated-form/with-yup";
import { useEffect, useState } from "react";
import { json, useActionData } from "remix";
import type { ActionFunction } from "remix";
import { ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

const noReplaceValidator = withYup(
  yup.object({
    noReplaceNameValidation: yup
      .string()
      .label("noReplaceNameValidation")
      .required(),
  })
);

export const action: ActionFunction = async ({ request }) =>
  json({ message: "Submitted!" });

export default function MyForm() {
  const data = useActionData();
  const [historyLength, setHistoryLength] = useState<number>(0);

  useEffect(() => {
    setHistoryLength(window.history.length);
  });

  return (
    <ValidatedForm
      validator={noReplaceValidator}
      method="post"
      defaultValues={{
        noReplaceNameValidation: "Jake",
      }}
      subaction="noReplaceValidation"
      replace
    >
      {data?.message && <p>{data.message}</p>}
      <p>
        History Length: <span data-testid="historyLength">{historyLength}</span>
      </p>
      <Input name="noReplaceNameValidation" label="noReplaceNameValidation" />
      <SubmitButton />
    </ValidatedForm>
  );
}
