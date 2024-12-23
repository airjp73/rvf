import { ActionFunctionArgs, useActionData } from "react-router";
import { withYup } from "@rvf/yup";
import { validationError } from "@rvf/react-router";
import * as yup from "yup";

const schema = yup.object({
  name: yup.string().required(),
});
const validator = withYup(schema);

export const action = async ({ request }: ActionFunctionArgs) => {
  const result = await validator.validate(await request.formData());
  if (result.error)
    return validationError({ fieldErrors: { name: "Submitted invalid form" } });

  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { message: `Submitted by ${result.data.name}` };
};

export default function Component() {
  const data = useActionData<typeof action>();
  return <h1>{data && "message" in data && <h1>{data.message}</h1>}</h1>;
}
