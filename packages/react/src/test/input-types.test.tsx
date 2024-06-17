import { render, screen } from "@testing-library/react";
import { useForm } from "../useForm";
import { successValidator } from "./util/successValidator";
import userEvent from "@testing-library/user-event";

describe("number inputs", () => {
  it("default values set as numbers", async () => {
    const TestComp = () => {
      const form = useForm({
        defaultValues: { age: 25 },
        validator: successValidator,
      });

      return (
        <form {...form.getFormProps()}>
          <input
            data-testid="age"
            {...form.field("age").getInputProps({ type: "number" })}
          />
          <pre data-testid="age-value">{JSON.stringify(form.value("age"))}</pre>
        </form>
      );
    };
    render(<TestComp />);

    expect(screen.getByTestId("age")).toHaveValue(25);
    expect(screen.getByTestId("age-value").textContent).toEqual("25");

    await userEvent.type(screen.getByTestId("age"), "4");
    expect(screen.getByTestId("age")).toHaveValue(254);
    expect(screen.getByTestId("age-value").textContent).toEqual("254");
  });

  it("no default value", async () => {
    const TestComp = () => {
      const form = useForm({
        validator: successValidator,
      });

      return (
        <form {...form.getFormProps()}>
          <input
            data-testid="age"
            {...form.field("age").getInputProps({ type: "number" })}
          />
          <pre data-testid="age-value">{JSON.stringify(form.value("age"))}</pre>
        </form>
      );
    };
    render(<TestComp />);

    expect(screen.getByTestId("age")).not.toHaveValue();
    expect(screen.getByTestId("age-value").textContent).toEqual("");

    await userEvent.type(screen.getByTestId("age"), "4");
    expect(screen.getByTestId("age")).toHaveValue(4);
    expect(screen.getByTestId("age-value").textContent).toEqual("4");
  });

  it("default values set as strings", async () => {
    const TestComp = () => {
      const form = useForm({
        defaultValues: { age: "25" },
        validator: successValidator,
      });

      return (
        <form {...form.getFormProps()}>
          <input
            data-testid="age"
            {...form.field("age").getInputProps({ type: "number" })}
          />
          <pre data-testid="age-value">{JSON.stringify(form.value("age"))}</pre>
        </form>
      );
    };
    render(<TestComp />);

    expect(screen.getByTestId("age")).toHaveValue(25);
    expect(screen.getByTestId("age-value").textContent).toEqual('"25"');

    await userEvent.type(screen.getByTestId("age"), "4");
    expect(screen.getByTestId("age")).toHaveValue(254);
    expect(screen.getByTestId("age-value").textContent).toEqual('"254"');
  });
});
