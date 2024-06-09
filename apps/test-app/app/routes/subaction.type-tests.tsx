/* eslint-disable @typescript-eslint/no-unused-expressions */
import { withZod } from "@rvf/zod";
import { ValidatedForm } from "@rvf/remix";
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
          ross: "ross",
        }}
        handleSubmit={(data) => {
          data.bob;
          // @ts-expect-error
          data.ross;
        }}
      >
        <p>Children</p>
      </ValidatedForm>
      <ValidatedForm
        validator={validator}
        subaction="action2"
        defaultValues={{
          ross: "ross",
          bob: "bob",
        }}
        handleSubmit={(data) => {
          data.ross;
          // @ts-expect-error
          data.bob;
        }}
      >
        <p>Children</p>
      </ValidatedForm>
    </>
  );
}
