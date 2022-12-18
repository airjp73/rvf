import { DataFunctionArgs, json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { validationError, ValidatedForm } from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Fieldset } from "~/components/Fieldset";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  z.object({
    likes: zfd.repeatable(
      z.array(z.string()).min(1, "Please choose at least one")
    ),
  })
);

export const action = async ({ request }: DataFunctionArgs) => {
  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error);
  const { likes } = result.data;
  const likesArray = Array.isArray(likes) ? likes : [likes];

  return json({ message: `You like ${likesArray.join(", ")}` });
};

export default function FrontendValidation() {
  const actionData = useActionData<typeof action>();
  return (
    <ValidatedForm validator={validator} method="post">
      {actionData && "message" in actionData && <h1>{actionData.message}</h1>}
      <Fieldset label="Likes" name="likes">
        <label>
          Pizza
          <input type="checkbox" name="likes" value="pizza" />
        </label>
        <label>
          Mushrooms
          <input type="checkbox" name="likes" value="mushrooms" />
        </label>
        <label>
          Cheese
          <input type="checkbox" name="likes" value="cheese" />
        </label>
        <label>
          Pepperoni
          <input type="checkbox" name="likes" value="pepperoni" />
        </label>
      </Fieldset>
      <SubmitButton />
    </ValidatedForm>
  );
}
