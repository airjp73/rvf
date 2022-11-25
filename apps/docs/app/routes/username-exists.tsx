/**
 * Endpoint used for asyncValidation example
 */

import { json, LoaderArgs } from "remix";
import { zfd } from "zod-form-data";

const schema = zfd.formData({
  username: zfd.text(),
});

export const loader = async ({ request }: LoaderArgs) => {
  const params = new URL(request.url).searchParams;
  const { username } = schema.parse(params);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (
    username.endsWith("123") ||
    username.endsWith("234")
  ) {
    return json({ usernameTaken: false, suggestions: [] });
  }

  return json({
    usernameTaken: true,
    suggestions: [`${username}123`, `${username}234`],
  });
};
