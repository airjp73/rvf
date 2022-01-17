import { withYup } from "@remix-validated-form/with-yup";
import { ActionFunction, useActionData } from "remix";
import { validationError, ValidatedForm, useField } from "remix-validated-form";
import * as yup from "yup";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({
  likes: yup.lazy((val) =>
    Array.isArray(val) ? yup.array().of(yup.string()) : yup.string().required()
  ),
});

const validator = withYup(schema);

export const action: ActionFunction = async ({ request }) => {
  const result = validator.validate(await request.formData());
  if (result.error) return validationError(result.error);
  const { likes } = result.data;
  const likesArray = Array.isArray(likes) ? likes : [likes];

  return { message: `You like ${likesArray.join(", ")}` };
};

const CheckboxError = () => {
  const { error } = useField("likes");
  return error ? <div>{error}</div> : null;
};

export default function FrontendValidation() {
  const actionData = useActionData();
  return (
    <ValidatedForm validator={validator} method="post">
      {actionData && <h1>{actionData.message}</h1>}
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
      <CheckboxError />
      <SubmitButton />
    </ValidatedForm>
  );
}
