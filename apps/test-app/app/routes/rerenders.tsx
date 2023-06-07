import { withYup } from "@remix-validated-form/with-yup";
import { useEffect, useRef } from "react";
import { useFormContext, ValidatedForm } from "remix-validated-form";
import * as yup from "yup";
import { Input } from "~/components/Input";

const schema = yup.object({
  firstName: yup.string().label("First Name").required(),
  email: yup.string().email().label("Email").required(),
});

const validator = withYup(schema);

/**
 * You shouldn't normally care that much about render count,
 * but we also shouldn't render on every keystroke
 * when the validation type is `onChange`.
 */
const RenderCounter = () => {
  // Since we subscribe to the form context,
  // this component will update when validation errors change
  useFormContext();
  const renderCount = useRef(0);

  let renderUpdated = false;
  useEffect(() => {
    if (renderUpdated) return;
    renderUpdated = true;
    renderCount.current++;
  });

  return (
    <>
      <p data-testid="render-count">{renderCount.current + 1}</p>
      <button
        type="button"
        onClick={() => {
          renderCount.current = 0;
        }}
      >
        Reset render count
      </button>
    </>
  );
};

export default function FrontendValidation() {
  return (
    <ValidatedForm validator={validator} method="post">
      <Input name="firstName" label="First Name" />
      <Input name="email" label="Email" />
      <RenderCounter />
    </ValidatedForm>
  );
}
