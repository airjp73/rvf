import { Link } from "@remix-run/react";
import { Alert } from "./Alert";

export const DeprecatedWarning = () => (
  <div className="not-prose">
    <Alert
      variant="warning"
      title="Deprecated"
      details={
        <>
          useFormContext is deprected in favor of{" "}
          <Link
            to="/reference/use-form-state"
            className="text-blue-500"
          >
            useFormState
          </Link>{" "}
          and{" "}
          <Link
            to="/reference/use-form-helpers"
            className="text-blue-500"
          >
            useFormHelpers
          </Link>
          .
        </>
      }
    />
  </div>
);
