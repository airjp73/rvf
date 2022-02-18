import { ActionFunction, json, useActionData } from "remix";

export const action: ActionFunction = async () =>
  json({ message: "Submitted to action prop action" });

export default function FrontendValidation() {
  const data = useActionData();
  return <p>{data?.message}</p>;
}
