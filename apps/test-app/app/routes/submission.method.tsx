import { DataFunctionArgs, json } from "react-router";
import { useActionData, useFetcher } from "react-router";
import { withYup } from "@rvf/yup";
import { ValidatedForm } from "@rvf/remix";
import * as yup from "yup";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({});
const validator = withYup(schema);

export const action = ({ request }: DataFunctionArgs) =>
  json({ message: `Submitted with method ${request.method.toUpperCase()}` });

export default function FrontendValidation() {
  const data = useActionData<typeof action>();
  const fetcher = useFetcher<typeof action>();

  return (
    <>
      <ValidatedForm validator={validator} method="patch">
        {data?.message && <p>{data.message}</p>}
        <SubmitButton label="Submit html form" />
      </ValidatedForm>
      <ValidatedForm fetcher={fetcher} validator={validator} method="patch">
        {fetcher.data?.message && <p>{fetcher.data.message}</p>}
        <SubmitButton label="Submit fetcher form" />
      </ValidatedForm>
    </>
  );
}
