import { withZod } from "@remix-validated-form/with-zod";
import { json, useActionData, ActionFunction } from "remix";
import {
  ValidatedForm,
  validationError,
} from "remix-validated-form";
import { z } from "zod";
import { Alert } from "~/components/Alert";
import { Checkbox } from "~/components/Checkbox";
import { SubmitButton } from "~/components/SubmitButton";

export const validator = withZod(
  z.object({
    likes: z.preprocess((val) => {
      if (Array.isArray(val)) return val;
      if (val) return [val];
      return [];
    }, z.array(z.string())),
  })
);

type ActionData = {
  likes: string[];
};

export const action: ActionFunction = async ({
  request,
}) => {
  const result = validator.validate(
    await request.formData()
  );
  if (result.error) return validationError(result.error);
  const { likes } = result.data;

  // For the sake of this example, we're just going to return
  // some data and display an alert in the UI
  return json<ActionData>({ likes });
};

export default function Demo() {
  const data = useActionData<ActionData>();

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      defaultValues={{
        likes: ["pizza", "cake"],
      }}
    >
      <fieldset>
        <legend>Which of these do you like?</legend>
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
      </fieldset>

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
