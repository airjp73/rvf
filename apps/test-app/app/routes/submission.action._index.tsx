import { Dialog, DialogTitle, DialogBackdrop } from "@headlessui/react";
import { withYup } from "@rvf/yup";
import { useState } from "react";
import { ValidatedForm } from "@rvf/react-router";
import * as yup from "yup";
import { SubmitButton } from "~/components/SubmitButton";
import { Route } from "./+types/submission.action._index";

const schema = yup.object({});
const validator = withYup(schema);

export const action = async (args: Route.ActionArgs) => ({
  message: "Submitted to in-route action.",
});

export default function FrontendValidation({
  actionData: data,
}: Route.ComponentProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ValidatedForm
        validator={validator}
        method="post"
        action="/submission/action/target"
      >
        {data?.message && <p>{data.message}</p>}
        <SubmitButton name="whichForm" value="Not in a dialog" />
      </ValidatedForm>

      <button type="button" onClick={() => setIsOpen(true)}>
        Open Dialog
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        style={{
          position: "fixed",
          top: "25%",
          left: "25%",
          right: 0,
          bottom: 0,
        }}
      >
        <DialogBackdrop />

        <DialogTitle>Modal Form</DialogTitle>

        <ValidatedForm
          validator={validator}
          method="post"
          action="/submission/action/target"
        >
          {data?.message && <p>{data.message}</p>}
          <SubmitButton
            data-testid="dialog-submit"
            name="whichForm"
            value="In a dialog"
          />
        </ValidatedForm>
      </Dialog>
    </>
  );
}
