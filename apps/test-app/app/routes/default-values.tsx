import { withZod } from "@rvf/zod";
import { ValidatedForm } from "@rvf/react-router";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Fieldset } from "~/components/Fieldset";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";
import { Route } from "./+types/default-values";

const validator = withZod(
  z.object({
    name: z.object({
      first: zfd.text(),
      last: zfd.text(),
    }),
    email: zfd.text(z.string().email()),
    age: zfd.numeric(),
    likesPizza: zfd.checkbox(),
    favoriteDessert: z.union([z.literal("iceCream"), z.literal("cake")]),
    likesColors: zfd.repeatable(),
  }),
);

export const loader = () => {
  return {
    defaultValues: {
      name: { first: "Jane", last: "Doe" },
      email: "jane.doe@example.com",
      age: 26,
      likesPizza: true,
      favoriteDessert: "cake",
      likesColors: ["red", "green"],
    },
  };
};

export default function DefaultValues({
  loaderData: { defaultValues },
}: Route.ComponentProps) {
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      defaultValues={defaultValues}
    >
      <Input name="name.first" label="First Name" />
      <Input name="name.last" label="Last Name" />
      <Input name="email" label="Email" />
      <Input name="age" type="number" label="Age" />
      <Input
        name="likesPizza"
        type="checkbox"
        label="Likes Pizza"
        value="yes"
      />
      <Fieldset label="Which colors do you like" name="likesColors">
        <Input
          data-testid="red"
          name="likesColors"
          type="checkbox"
          label="Red"
          value="red"
          hideErrors
        />
        <Input
          data-testid="blue"
          name="likesColors"
          type="checkbox"
          label="Blue"
          value="blue"
          hideErrors
        />
        <Input
          data-testid="green"
          name="likesColors"
          type="checkbox"
          label="Green"
          value="green"
          hideErrors
        />
        <input name="likesColors" type="checkbox" value="yellow" />
      </Fieldset>
      <Fieldset label="Favorite dessert" name="likesColors">
        <Input
          data-testid="iceCream"
          label="Ice Cream"
          type="radio"
          name="favoriteDessert"
          value="iceCream"
          hideErrors
        />
        <Input
          data-testid="cake"
          label="Cake"
          type="radio"
          name="favoriteDessert"
          value="cake"
          hideErrors
        />
      </Fieldset>
      <SubmitButton />
    </ValidatedForm>
  );
}
