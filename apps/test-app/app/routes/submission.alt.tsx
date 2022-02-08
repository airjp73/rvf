import { ActionFunction, redirect } from "remix";

export const action: ActionFunction = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return redirect("/submission");
};
