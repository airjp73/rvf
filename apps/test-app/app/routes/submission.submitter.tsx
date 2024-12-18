import { ActionFunctionArgs, useLoaderData } from "react-router";
import { withYup } from "@rvf/yup";
import { ValidatedForm } from "@rvf/react-router";
import * as yup from "yup";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withYup(yup.object({}));

export const loader = async ({ request }: ActionFunctionArgs) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const url = new URL(request.url);
  const submitter = url.searchParams.get("submitter");
  return {
    method: request.method,
    submitter: submitter || undefined,
  };
};

export default function FrontendValidation() {
  const data = useLoaderData<typeof loader>();
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
