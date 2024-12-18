import { withYup } from "@rvf/yup";
import {
  FormScope,
  FormProvider,
  useForm,
  useFormScopeOrContext,
} from "@rvf/react-router";
import * as yup from "yup";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";
import { Route } from "./+types/context-hooks";

export const action = async ({ request }: Route.ActionArgs) => {
  const data = await request.formData();
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { message: `Submitted ${data.get("mySubmit")}` };
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

export default function FrontendValidation({
  actionData,
}: Route.ComponentProps) {
  // Verify we don't get an infinite loop
  const form = useForm({
    id: "test-form",
    defaultValues: { firstName: "defaultFirstName" },
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
          {form.renderFormIdInput()}
          <Input name="firstName" label="First Name" />
          <DisplayContext testid="internal-values" />
          <SubmitButton />
        </form>
      </FormProvider>
    </>
  );
}
