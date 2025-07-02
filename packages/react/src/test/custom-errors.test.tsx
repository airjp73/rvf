import { render, screen } from "@testing-library/react";
import { useForm } from "../useForm";
import userEvent from "@testing-library/user-event";
import { FieldErrors, createValidator } from "@rvf/core";

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
        else if (api.unvalidatedData.firstName === "Jane Doe")
          form.unstable_setCustomError("firstName", "same problem");
        else form.unstable_setCustomError("firstName", null);
      },
      handleSubmit,
    });

    return (
      <form {...form.getFormProps()}>
        <input {...form.getInputProps("firstName")} data-testid="firstName" />
        <pre data-testid="firstName-error">{form.error("firstName")}</pre>
        <pre data-testid="is-submitting">
          {form.formState.isSubmitting ? "true" : "false"}
        </pre>
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TextComp />);

  await userEvent.type(screen.getByTestId("firstName"), "Jane");
  expect(screen.getByTestId("firstName-error")).toHaveTextContent("wrong name");

  await userEvent.click(screen.getByTestId("submit"));
  expect(screen.getByTestId("is-submitting")).toHaveTextContent("false");
  expect(screen.getByTestId("firstName-error")).toHaveTextContent(
    "for real though",
  );
  expect(handleSubmit).not.toBeCalled();
  expect(screen.getByTestId("is-submitting")).toHaveTextContent("false");

  // The custom error doesn't go away yet.
  await userEvent.type(screen.getByTestId("firstName"), " Doe");
  expect(screen.getByTestId("firstName-error")).toHaveTextContent(
    "for real though",
  );

  await userEvent.click(screen.getByTestId("submit"));
  expect(screen.getByTestId("firstName-error")).toHaveTextContent(
    "same problem",
  );
  expect(handleSubmit).not.toBeCalled();
  expect(screen.getByTestId("is-submitting")).toHaveTextContent("false");
});

it("should still call onBeforeSubmit when there are custom errors", async () => {
  const handleSubmit = vi.fn();
  const TextComp = () => {
    const form = useForm({
      defaultValues: {
        firstName: "",
        lastName: "",
      },
      validationBehaviorConfig: {
        initial: "onChange",
        whenTouched: "onChange",
        whenSubmitted: "onChange",
      },
      validator: createValidator({
        validate: (data) => Promise.resolve({ data, error: undefined }),
      }),
      onBeforeSubmit: async (api) => {
        if (api.unvalidatedData.firstName === "wrong")
          form.unstable_setCustomError("firstName", "wrong name");
        else form.unstable_setCustomError("firstName", null);

        if (api.unvalidatedData.lastName === "wrong")
          form.unstable_setCustomError("lastName", "wrong name");
        else form.unstable_setCustomError("lastName", null);
      },
      handleSubmit,
    });

    return (
      <form {...form.getFormProps()}>
        <input {...form.getInputProps("firstName")} data-testid="firstName" />
        <pre data-testid="firstName-error">{form.error("firstName")}</pre>
        <input {...form.getInputProps("lastName")} data-testid="lastName" />
        <pre data-testid="lastName-error">{form.error("lastName")}</pre>
        <pre data-testid="is-submitting">
          {form.formState.isSubmitting ? "true" : "false"}
        </pre>
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TextComp />);

  await userEvent.type(screen.getByTestId("firstName"), "wrong");
  await userEvent.type(screen.getByTestId("lastName"), "wrong");
  await userEvent.click(screen.getByTestId("submit"));
  expect(screen.getByTestId("firstName-error")).toHaveTextContent("wrong name");
  expect(screen.getByTestId("lastName-error")).toHaveTextContent("wrong name");

  await userEvent.type(screen.getByTestId("firstName"), "right");
  expect(screen.getByTestId("firstName-error")).toHaveTextContent("wrong name");
  expect(screen.getByTestId("lastName-error")).toHaveTextContent("wrong name");

  await userEvent.click(screen.getByTestId("submit"));
  expect(screen.getByTestId("firstName-error")).toBeEmptyDOMElement();
  expect(screen.getByTestId("lastName-error")).toHaveTextContent("wrong name");

  await userEvent.type(screen.getByTestId("lastName"), "right");
  await userEvent.click(screen.getByTestId("submit"));
  expect(screen.getByTestId("firstName-error")).toBeEmptyDOMElement();
  expect(screen.getByTestId("lastName-error")).toBeEmptyDOMElement();
});
