import { DataFunctionArgs, json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";

export const action = async ({ request }: DataFunctionArgs) => {
  const formData = await request.formData();
  return json({
    message: `Submitted to action prop action from form: ${formData.get(
      "whichForm",
    )}`,
  });
};

export default function FrontendValidation() {
  const data = useActionData<typeof action>();
  return <p>{data?.message}</p>;
}
