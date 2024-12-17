import { DataFunctionArgs, json } from "react-router";
import { useLoaderData } from "react-router";
import { withYup } from "@rvf/yup";
import { useForm } from "@rvf/react-router";
import * as yup from "yup";
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

  return json({ shouldReload, message: undefined as string | undefined });
};

export default function FrontendValidation() {
  const data = useLoaderData<typeof loader>();
  const form = useForm({
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
