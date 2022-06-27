import { withYup } from "@remix-validated-form/with-yup";
import { json, LoaderFunction, useLoaderData } from "remix";
import { ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withYup(yup.object({}));

export type LoaderData = {
  method: string;
  submitter?: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const url = new URL(request.url);
  const submitter = url.searchParams.get("submitter");
  return json<LoaderData>({
    method: request.method,
    submitter: submitter || undefined,
  });
};

export default function FrontendValidation() {
  const data = useLoaderData();
  return (
    <ValidatedForm validator={validator} method="post" id="test-form">
      <code>{JSON.stringify(data)}</code>
      <SubmitButton
        name="submitter"
        value="viaget"
        label="Submit GET"
        formMethod="get"
      />
    </ValidatedForm>
  );
}
