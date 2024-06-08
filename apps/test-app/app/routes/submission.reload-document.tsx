import { DataFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { withYup } from "@rvf/yup";
import { ValidatedForm, useRvf } from "@rvf/remix";
import * as yup from "yup";
import { SubmitButton } from "~/components/SubmitButton";
import { useEffect, useRef } from "react";

const schema = yup.object({});
const validator = withYup(schema);

export const loader = async ({ request }: DataFunctionArgs) => {
  const url = new URL(request.url);
  const isSubmitted = url.searchParams.has("hasBeenSubmitted");
  const shouldReload = url.searchParams.has("reload");

  if (isSubmitted) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return json({ message: "Submitted!", shouldReload });
  }

  return json({ shouldReload, message: undefined });
};

export default function FrontendValidation() {
  const data = useLoaderData<typeof loader>();
  const form = useRvf({
    validator,
    method: "get",
    reloadDocument: data.shouldReload,
  });

  const wasSet = useRef(false);
  useEffect(() => {
    if (wasSet.current) return;
    wasSet.current = true;
    const el = document.querySelector("div[data-testid=reload-message]");
    if (el) el.textContent = String(Date.now());
  }, []);

  return (
    <form {...form.getFormProps()}>
      <div data-testid="reload-message" />
      {data.message && <p>{data.message}</p>}
      <input type="hidden" name="hasBeenSubmitted" value="true" />
      <button type="submit" data-testid="submit">
        Submit
      </button>
    </form>
  );
}
