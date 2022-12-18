import { DataFunctionArgs, redirect } from "@remix-run/node";

export const action = async (args: DataFunctionArgs) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return redirect("/submission");
};
