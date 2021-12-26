import { ActionFunction, json } from "remix";
import { withZod } from "remix-validated-form";
import { z } from "zod";

export const validator = withZod(
  z.object({
    firstName: z.string().nonempty("First name is required"),
    lastName: z.string().nonempty("Last name is required"),
    email: z
      .string()
      .nonempty("Email is required")
      .email("Must be a valid email"),
  })
);

export const action: ActionFunction = () => {
  return json({
    title: "Submit worked!",
    description: "Submitting this form returned a result, woo!",
  });
};
