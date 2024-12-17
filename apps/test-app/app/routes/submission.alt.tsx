import { redirect } from "react-router";

export const action = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return redirect("/submission");
};
