import { withZod } from "@remix-validated-form/with-zod";
import { json, useActionData, ActionFunction } from "remix";
import {
  ValidatedForm,
  validationError,
  ValidatorData,
} from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Alert } from "~/components/Alert";
import { Checkbox } from "~/components/Checkbox";
import { CheckboxGroup } from "~/components/CheckboxGroup";
import { SubmitButton } from "~/components/SubmitButton";

export const validator = withZod(
  z.object({ likes: zfd.repeatable() })
);

export const action: ActionFunction = async ({
  request,
}) => {
  const result = await validator.validate(
    await request.formData()
  );
  if (result.error) return validationError(result.error);
  const { likes } = result.data;

  // For the sake of this example, we're just going to return
  // some data and display an alert in the UI
  return json<ValidatorData<typeof validator>>({ likes });
};

export default function Demo() {
  const data =
    useActionData<ValidatorData<typeof validator>>();

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      defaultValues={{
        likes: ["pizza", "cake"],
      }}
    >
      <CheckboxGroup
        name="likes"
        label="Which of these do you like?"
      >
        <Checkbox
          name="likes"
          value="pizza"
          label="Pizza"
        />
        <Checkbox name="likes" value="cake" label="Cake" />
        <Checkbox
          name="likes"
          value="spaghetti"
          label="Spaghetti"
        />
      </CheckboxGroup>

      {data && (
        <Alert
          variant="info"
          title="Hello!"
          details={
            data.likes.length
              ? `You like ${data.likes.join(", ")}`
              : "You don't like anything!"
          }
        />
      )}
      <SubmitButton />
    </ValidatedForm>
  );
}
