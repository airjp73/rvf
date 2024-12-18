import { withZod } from "@rvf/zod";
import { validationError, ValidatedForm } from "@rvf/react-router";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Fieldset } from "~/components/Fieldset";
import { SubmitButton } from "~/components/SubmitButton";
import { Route } from "./+types/checkboxes";

const validator = withZod(
  z.object({
    likes: zfd.repeatable(
      z.array(z.string()).min(1, "Please choose at least one"),
    ),
  }),
);

export const action = async ({ request }: Route.ActionArgs) => {
  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error);
  const { likes } = result.data;
  const likesArray = Array.isArray(likes) ? likes : [likes];

  return { message: `You like ${likesArray.join(", ")}` };
};

export default function FrontendValidation({
  actionData,
}: Route.ComponentProps) {
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
