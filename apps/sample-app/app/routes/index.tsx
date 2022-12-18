import { DataFunctionArgs, redirect } from "@remix-run/node";

export let loader = async (args: DataFunctionArgs) => {
  return redirect("/subjects");
};
