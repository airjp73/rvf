import { LoaderFunction, redirect } from "remix";

export let loader: LoaderFunction = () => {
  return redirect("/subjects");
};
