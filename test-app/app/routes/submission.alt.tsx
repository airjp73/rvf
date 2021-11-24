import { ActionFunction, json, redirect } from "remix";

export const action: ActionFunction = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return redirect("/submission");
};
