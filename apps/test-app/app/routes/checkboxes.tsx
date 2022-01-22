import { withZod } from "@remix-validated-form/with-zod";
import { FC } from "react";
import { ActionFunction, useActionData } from "remix";
import { validationError, ValidatedForm, useField } from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  z.object({
    likes: zfd.repeatable(
      z.array(z.string()).min(1, "Please choose at least one")
    ),
  })
);

export const action: ActionFunction = async ({ request }) => {
  const result = validator.validate(await request.formData());
  if (result.error) return validationError(result.error);
  const { likes } = result.data;
  const likesArray = Array.isArray(likes) ? likes : [likes];

  return { message: `You like ${likesArray.join(", ")}` };
};

const Checkboxes: FC = ({ children }) => {
  const { error, validate } = useField("likes");
  return (
    <fieldset onChange={validate}>
      <legend>Likes</legend>
      {children}
      {error ? <p style={{ color: "red" }}>{error}</p> : null}
    </fieldset>
  );
};

export default function FrontendValidation() {
  const actionData = useActionData();
  return (
    <ValidatedForm validator={validator} method="post">
      {actionData && <h1>{actionData.message}</h1>}
      <Checkboxes>
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
      </Checkboxes>
      <SubmitButton />
    </ValidatedForm>
  );
}
