import { DataFunctionArgs, json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { withYup } from "@rvf/yup";
import {
  Rvf,
  ValidatedForm,
  useRvfContext,
  useRvf,
  useRvfOrContext,
} from "@rvf/remix";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";

export const action = async ({ request }: DataFunctionArgs) => {
  const data = await request.formData();
  await new Promise((resolve) => setTimeout(resolve, 500));
  return json({ message: `Submitted ${data.get("mySubmit")}` });
};

const DisplayContext = ({
  testid,
  form,
}: {
  testid: string;
  form?: Rvf<any>;
}) => {
  const context = useRvfOrContext(form);

  return (
    <div data-testid={testid}>
      <dl>
        <dt>hasBeenSubmitted</dt>
        <dd>{context.formState.hasBeenSubmitted ? "true" : "false"}</dd>

        <dt>isValid</dt>
        <dd>{context.formState.isValid ? "true" : "false"}</dd>

        <dt>action</dt>
        <dd>{context.formOptions.action}</dd>

        <dt>fieldErrors</dt>
        <dd>
          <pre>{JSON.stringify(context.formState.fieldErrors)}</pre>
        </dd>

        <dt>defaultValues</dt>
        <dd>
          <pre>{JSON.stringify(context.defaultValue())}</pre>
        </dd>

        <dt>touchedFields</dt>
        <dd>
          <pre>{JSON.stringify(context.formState.touchedFields)}</pre>
        </dd>

        <dt>getValues</dt>
        <dd>
          <pre>{JSON.stringify(Object.fromEntries(context.value()))}</pre>
        </dd>
      </dl>
    </div>
  );
};

export default function FrontendValidation() {
  const actionData = useActionData<typeof action>();

  // Verify we don't get an infinite loop
  const form = useRvf({
    validator: withYup(
      yup.object({
        firstName: yup.string().label("First Name").required(),
      }),
    ),
    method: "post",
    action: "/context-hooks",
    defaultValues: { firstName: "defaultFirstName" },
  });

  return (
    <>
      {actionData?.message && <h1>{actionData.message}</h1>}
      <DisplayContext testid="external-values" form={form.scope()} />
      <form {...form.getFormProps()}>
        <Input name="firstName" label="First Name" />
        <DisplayContext testid="internal-values" />
        <SubmitButton />
      </form>
    </>
  );
}
