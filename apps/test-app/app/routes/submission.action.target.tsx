import { useActionData } from "react-router";
import { Route } from "./+types/submission.action.target";

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  return {
    message: `Submitted to action prop action from form: ${formData.get(
      "whichForm",
    )}`,
  };
};

export default function FrontendValidation({
  actionData: data,
}: Route.ComponentProps) {
  return <p>{data?.message}</p>;
}
