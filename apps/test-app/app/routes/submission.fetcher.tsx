import { DataFunctionArgs, json } from "@remix-run/node";

export const action = async (args: DataFunctionArgs) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return json({ done: "done" });
};
