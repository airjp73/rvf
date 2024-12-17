import { useRef, useState } from "react";
import { Button } from "~/ui/button";
import { Input } from "~/ui/input";
import { Label } from "~/ui/label";
import { signUp } from "./api";
import { showToastMessage } from "~/lib/utils";

export const SignupForm = () => {
  const confirmRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkPasswordsMatch = () => {
    if (
      !confirmRef.current?.validity.valid &&
      confirmRef.current?.value === passwordRef.current?.value
    )
      confirmRef.current?.setCustomValidity("");
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);

        const username = data.get("username");
        const password = data.get("password");
        const confirmPassword = data.get("confirm-password");

        if (password !== confirmPassword) {
          confirmRef.current?.setCustomValidity("Passwords must match");
          confirmRef.current?.reportValidity();
          return;
        }

        setIsSubmitting(true);
        await signUp({ username, password });
        setIsSubmitting(false);
        (e.target as HTMLFormElement).reset();
        showToastMessage("Account created!");
      }}
    >
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
          ref={passwordRef}
          onChange={checkPasswordsMatch}
        />
      </Label>

      <Label>
        Confirm password
        <Input
          name="confirm-password"
          required
          type="password"
          ref={confirmRef}
          onChange={checkPasswordsMatch}
        />
      </Label>

      <Button type="submit" isLoading={isSubmitting}>
        Submit
      </Button>
    </form>
  );
};
