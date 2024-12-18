import { useFetcher } from "react-router";
import { withYup } from "@rvf/yup";
import { ValidatedForm } from "@rvf/react-router";
import * as yup from "yup";
import { SubmitButton } from "~/components/SubmitButton";
import { Route } from "./+types/submission.get.fetcher";

const schema = yup.object({});
const validator = withYup(schema);

export const loader = async ({ request }: Route.ActionArgs) => {
  const url = new URL(request.url);
  const isSubmitted = url.searchParams.has("submit");

  if (isSubmitted) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { message: "Submitted!" };
  }

  return { message: undefined };
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
