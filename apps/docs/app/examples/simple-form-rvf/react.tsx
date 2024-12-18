import { useForm, useNativeValidity } from "@rvf/react";
import { useRef } from "react";
import { Button } from "~/ui/button";
import { Input } from "~/ui/input";
import { Label } from "~/ui/label";
import { signUp } from "../simple-form/api";
import { showToastMessage } from "~/lib/utils";
import { withZod } from "@rvf/zod";
import { z } from "zod";

const validator = withZod(
  z
    .object({
      username: z.string(),
      password: z.string(),
      confirmPassword: z.string(),
    })
    .superRefine((value, ctx) => {
      if (value.password !== value.confirmPassword)
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Passwords must match",
        });
    }),
);

export const SignupForm = () => {
  const form = useForm({
    validator,
    resetAfterSubmit: true,
    handleSubmit: async ({ username, password }) => {
      await signUp({ username, password });
      showToastMessage("Account created!");
    },
  });

  const confirmRef = useRef<HTMLInputElement>(null);
  useNativeValidity(
    confirmRef,
    form.error("confirmPassword"),
  );

  return (
    <form {...form.getFormProps()}>
      <h3>Create an account</h3>

      <Label>
        Username
        <Input name="username" required />
      </Label>

      <Label>
        Password
        <Input
          id="password"
          name="password"
          required
          type="password"
        />
      </Label>

      <Label>
        Confirm password
        <Input
          name="confirmPassword"
          required
          type="password"
          ref={confirmRef}
        />
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
