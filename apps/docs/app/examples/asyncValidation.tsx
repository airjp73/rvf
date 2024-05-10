import { DataFunctionArgs, json } from "@remix-run/node";
import {
  useActionData,
  useFetcher,
} from "@remix-run/react";
import { withZod } from "@rvf/zod";
import { ValidatedForm, validationError } from "@rvf/remix";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Alert } from "~/components/Alert";
import { FormInput } from "~/components/FormInput";
import { SubmitButton } from "~/components/SubmitButton";
import { db } from "~/examples/usernameExists/db";
import type { loader as usernameExistsLoader } from "~/routes/username-exists";

/**
 * The base schema for our form.
 */
const schema = z
  .object({
    username: zfd.text(),
    password: zfd.text(),
    passwordConfirm: zfd.text(),
  })
  .refine(
    ({ password, passwordConfirm }) =>
      password === passwordConfirm,
    {
      path: ["passwordConfirm"],
      message: "Passwords must match",
    },
  );

/**
 * The client version of our validator
 */
const clientValidator = withZod(schema);

/**
 * In our action we create a second, server-side validation that checks if the
 * username exists in the database already.
 */
export const action = async ({
  request,
}: DataFunctionArgs) => {
  const serverValidator = withZod(
    schema.refine(
      async (data) => {
        const usernameAvailable =
          await db.isUsernameAvailable(data.username);
        return usernameAvailable;
      },
      {
        message: "Whoops! That username is taken.",
        path: ["username"],
      },
    ),
  );

  // Since the db check is already in the schema, we can continue on as normal
  const result = await serverValidator.validate(
    await request.formData(),
  );
  if (result.error) return validationError(result.error);

  return json({ message: "You got the username!" });
};

/**
 * An input component that checks if a username is taken.
 */
const UsernameInput = () => {
  const usernameCheckFetcher =
    useFetcher<typeof usernameExistsLoader>();

  const getUsernameMessage = () => {
    if (usernameCheckFetcher.state === "loading")
      return (
        <Alert
          variant="info"
          title="Checking username..."
        />
      );

    if (!usernameCheckFetcher.data) return null;

    const { usernameTaken, suggestions } =
      usernameCheckFetcher.data;

    if (usernameTaken)
      return (
        <Alert
          variant="error"
          title="That username is taken, but one of these would work"
          details={
            <ul>
              {suggestions.map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          }
        />
      );

    return (
      <Alert
        variant="success"
        title="That username is available!"
      />
    );
  };

  return (
    <div className="space-y-2">
      <FormInput
        name="username"
        label="Username"
        onBlur={(event) => {
          const username = event.target.value;
          if (username) {
            // Ping our api to see if the username is taken.
            usernameCheckFetcher.load(
              `/username-exists?username=${username}`,
            );
          }

          // We could do this onChange too, but we would need to
          // make sure we throttle or debounce the requests.
        }}
      />
      {getUsernameMessage()}
    </div>
  );
};

/**
 * Our actual route component
 */
export default function AsyncValidation() {
  const data = useActionData();
  return (
    <ValidatedForm
      validator={clientValidator}
      method="post"
    >
      <UsernameInput />
      <FormInput
        type="password"
        name="password"
        label="Password"
      />
      <FormInput
        type="password"
        name="passwordConfirm"
        label="Confirm Password"
      />
      {data?.message && (
        <Alert variant="success" title={data.message} />
      )}
      <SubmitButton />
    </ValidatedForm>
  );
}
