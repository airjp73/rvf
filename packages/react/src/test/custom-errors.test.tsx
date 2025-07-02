import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useForm } from "../useForm";
import userEvent from "@testing-library/user-event";
import { RenderCounter } from "./util/RenderCounter";
import { FieldErrors, FormScope, createValidator } from "@rvf/core";
import { useField } from "../field";

it("should handle custom errors", async () => {
  const handleSubmit = vi.fn();
  const TextComp = () => {
    const form = useForm({
      defaultValues: {
        firstName: "",
      },
      validationBehaviorConfig: {
        initial: "onChange",
        whenTouched: "onChange",
        whenSubmitted: "onChange",
      },
      validator: createValidator({
        validate: (data) => {
          const errors: FieldErrors = {};
          if (data.firstName === "Jane") errors["firstName"] = "wrong name";
          if (Object.keys(errors).length > 0)
            return Promise.resolve({ error: errors, data: undefined });
          return Promise.resolve({ data, error: undefined });
        },
      }),
      onBeforeSubmit: async (api) => {
        if (api.unvalidatedData.firstName === "Jane")
          form.unstable_setCustomError("firstName", "for real though.");
        else form.unstable_setCustomError("firstName", null);
      },
      handleSubmit,
    });

    return (
      <form {...form.getFormProps()}>
        <input {...form.getInputProps("firstName")} data-testid="firstName" />
        <pre data-testid="firstName-error">{form.error("firstName")}</pre>
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TextComp />);

  await userEvent.type(screen.getByTestId("firstName"), "Jane");
  expect(screen.getByTestId("firstName-error")).toHaveTextContent("wrong name");

  await userEvent.click(screen.getByTestId("submit"));
  expect(screen.getByTestId("firstName-error")).toHaveTextContent(
    "for real though",
  );
  expect(handleSubmit).not.toBeCalled();

  // The custom error doesn't go away yet.
  await userEvent.type(screen.getByTestId("firstName"), " Doe");
  expect(screen.getByTestId("firstName-error")).toHaveTextContent(
    "for real though",
  );

  await userEvent.click(screen.getByTestId("submit"));
  expect(handleSubmit).toBeCalled();
});
