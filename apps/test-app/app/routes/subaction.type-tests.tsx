/* eslint-disable @typescript-eslint/no-unused-expressions */
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm } from "remix-validated-form";
import { z } from "zod";

const schema = z.union([
  z.object({ subaction: z.literal("action1"), bob: z.string() }),
  z.object({ subaction: z.literal("action2"), ross: z.string() }),
]);
const validator = withZod(schema);

export default function SubactionSubmissions() {
  return (
    <>
      <ValidatedForm
        validator={validator}
        subaction="action1"
        defaultValues={{
          bob: "bob",
          // @ts-expect-error
          ross: "ross",
        }}
        onSubmit={(data) => {
          data.bob;
          // @ts-expect-error
          data.ross;
        }}
      />
      <ValidatedForm
        validator={validator}
        subaction="action2"
        defaultValues={{
          ross: "ross",
          // @ts-expect-error
          bob: "bob",
        }}
        onSubmit={(data) => {
          data.ross;
          // @ts-expect-error
          data.bob;
        }}
      />
    </>
  );
}
