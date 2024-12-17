import { DataFunctionArgs, redirect } from "react-router";

export const action = async (args: DataFunctionArgs) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return redirect("/submission");
};
