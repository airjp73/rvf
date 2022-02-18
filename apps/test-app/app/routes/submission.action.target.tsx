import { ActionFunction, json, useActionData } from "remix";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  return json({
    message: `Submitted to action prop action from form: ${formData.get(
      "whichForm"
    )}`,
  });
};

export default function FrontendValidation() {
  const data = useActionData();
  return <p>{data?.message}</p>;
}
