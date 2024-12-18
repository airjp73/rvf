import { Button } from "~/ui/button";
import { Input } from "~/ui/input";
import { Label } from "~/ui/label";
import { useForm } from "@rvf/react";
import { withZod } from "@rvf/zod";
import { z } from "zod";

export const DefaultValuesForm = () => {
  const form = useForm({
    validator: withZod(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z
          .string()
          .min(1)
          .email("Must be a valid email"),
      }),
    ),
    defaultValues: {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
    },
  });

  return (
    <form {...form.getFormProps()}>
      <h3>Create an account</h3>

      <Label>
        First name
        <Input {...form.getInputProps("firstName")} />
      </Label>

      <Label>
        Last name
        <Input {...form.getInputProps("lastName")} />
      </Label>

      <Label>
        Email
        <Input {...form.getInputProps("email")} />
      </Label>

      <Button
        type="submit"
        isLoading={form.formState.isSubmitting}
      >
        Submit
      </Button>
    </form>
  );
};
