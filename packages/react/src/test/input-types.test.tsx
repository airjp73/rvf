import { render, screen, waitFor } from "@testing-library/react";
import { useForm } from "../useForm";
import { successValidator } from "./util/successValidator";
import userEvent from "@testing-library/user-event";
import { ZeroCurvatureEnding } from "three";

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

    await userEvent.clear(screen.getByTestId("age"));
    expect(screen.getByTestId("age")).toHaveValue(null);
    expect(screen.getByTestId("age-value").textContent).toEqual("null");
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

    // Clearing the input
    await userEvent.clear(screen.getByTestId("age"));
    expect(screen.getByTestId("age")).toHaveValue(null);
    expect(screen.getByTestId("age-value").textContent).toEqual("null");
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

    await userEvent.clear(screen.getByTestId("age"));
    expect(screen.getByTestId("age")).toHaveValue(null);
    expect(screen.getByTestId("age-value").textContent).toEqual("null");
  });

  it("null default", async () => {
    const TestComp = () => {
      const form = useForm({
        defaultValues: { age: null },
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

    expect(screen.getByTestId("age")).toHaveValue(null);
    expect(screen.getByTestId("age-value").textContent).toEqual("null");

    await userEvent.type(screen.getByTestId("age"), "4");
    expect(screen.getByTestId("age")).toHaveValue(4);
    expect(screen.getByTestId("age-value").textContent).toEqual("4");
  });
});

it("should always treat the value of a radio group as a string", async () => {
  const TestComp = () => {
    const form = useForm({
      validator: successValidator,
      defaultValues: {
        radio: "value1",
      },
    });
    return (
      <div>
        <input
          {...form.getInputProps("radio", { type: "radio", value: "value1" })}
          data-testid="radio1"
        />
        <input
          {...form.getInputProps("radio", { type: "radio", value: "value2" })}
          data-testid="radio2"
        />
        <div data-testid="value">{form.value("radio")}</div>
      </div>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("value").textContent).toBe("value1");
  await userEvent.click(screen.getByTestId("radio2"));
  expect(screen.getByTestId("value").textContent).toBe("value2");
});

it("should use `undefined` as the value when no radio is checked", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      validator: successValidator,
      handleSubmit: submit,
    });
    return (
      <form {...form.getFormProps()}>
        <input type="radio" name="radio" value="value1" />
        <input type="radio" name="radio" value="value2" />
        <button type="submit" data-testid="submit">
          Submit
        </button>
      </form>
    );
  };

  render(<TestComp />);
  await userEvent.click(screen.getByTestId("submit"));
  await waitFor(() => {
    expect(submit).toHaveBeenCalledTimes(1);
  });
  expect(submit).toHaveBeenCalledWith({}, expect.any(FormData), {});
});

// LAUNCH:
it.todo("moving keyboard focus to a radio shouldn't cause validation to run");
it.todo(
  "clicking vaguely around a radio without focusing shouldn't cause validation to run",
);
