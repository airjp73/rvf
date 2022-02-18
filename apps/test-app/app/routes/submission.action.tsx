import { Dialog } from "@headlessui/react";
import { withYup } from "@remix-validated-form/with-yup";
import { useState } from "react";
import { ActionFunction, json, useActionData } from "remix";
import { ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { SubmitButton } from "~/components/SubmitButton";

const schema = yup.object({});
const validator = withYup(schema);

export const action: ActionFunction = async () =>
  json({ message: "Submitted to in-route action." });

export default function FrontendValidation() {
  const data = useActionData();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ValidatedForm
        validator={validator}
        method="post"
        action="/submission/action/target"
      >
        {data?.message && <p>{data.message}</p>}
        <SubmitButton />
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
        <Dialog.Overlay />

        <Dialog.Title>Modal Form</Dialog.Title>

        <ValidatedForm
          validator={validator}
          method="post"
          action="/submission/action/target"
        >
          {data?.message && <p>{data.message}</p>}
          <SubmitButton data-testid="dialog-submit" />
        </ValidatedForm>
      </Dialog>
    </>
  );
}
