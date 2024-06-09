import { DataFunctionArgs, json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { withYup } from "@rvf/yup";
import {
  FormScope,
  FormProvider,
  useRemixFormResponse,
  useForm,
  useFormScopeOrContext,
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
  form?: FormScope<any>;
}) => {
  const context = useFormScopeOrContext(form);

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
          <pre>{JSON.stringify(context.value())}</pre>
        </dd>
      </dl>
    </div>
  );
};

export default function FrontendValidation() {
  const actionData = useActionData<typeof action>();

  const server = useRemixFormResponse({
    formId: "test-form",
    defaultValues: { firstName: "defaultFirstName" },
  });
  // Verify we don't get an infinite loop
  const form = useForm({
    ...server.getFormOpts(),
    validator: withYup(
      yup.object({
        firstName: yup.string().label("First Name").required(),
      }),
    ),
    action: "/context-hooks",
    method: "post",
  });

  return (
    <>
      {actionData?.message && <h1>{actionData.message}</h1>}
      <DisplayContext testid="external-values" form={form.scope()} />
      <FormProvider scope={form.scope()}>
        <form {...form.getFormProps()}>
          {server.renderHiddenInputs()}
          <Input name="firstName" label="First Name" />
          <DisplayContext testid="internal-values" />
          <SubmitButton />
        </form>
      </FormProvider>
    </>
  );
}
