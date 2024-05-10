import { DataFunctionArgs, json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { withYup } from "@rvf/yup";
import { ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({});
const validator = withYup(schema);

export const loader = async ({ request }: DataFunctionArgs) => {
  const url = new URL(request.url);
  const isSubmitted = url.searchParams.has("submit");

  if (isSubmitted) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return json({ message: "Submitted!" });
  }

  return json({ message: undefined });
};

export default function FrontendValidation() {
  const fetcher = useFetcher<typeof loader>();
  return (
    <ValidatedForm validator={validator} method="get" fetcher={fetcher}>
      {!!fetcher.data && "message" in fetcher.data && (
        <p>{fetcher.data.message}</p>
      )}
      <SubmitButton
        name="submit"
        value="true"
        label="Submit"
        submittingLabel="Submitting..."
      />
    </ValidatedForm>
  );
}
