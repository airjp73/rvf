import { ActionFunction, json } from "remix";

export const action: ActionFunction = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return json({ done: "done" });
};
