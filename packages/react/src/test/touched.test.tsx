import { render, screen } from "@testing-library/react";
import { useRef } from "react";
import { useRvf } from "../useRvf";
import userEvent from "@testing-library/user-event";
import { successValidator } from "./util/successValidator";
import { controlInput } from "./util/controlInput";

it("should subscribe to changes in the touched state", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "bar",
        baz: { a: "quux" },
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    const renderCounter = useRef(0);
    renderCounter.current++;

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...controlInput(form.field("foo"))} />
        <pre data-testid="foo-touched">
          {form.touched("foo") ? "true" : "false"}
        </pre>

        <input data-testid="baz.a" {...form.field("baz.a").getInputProps()} />
        <pre data-testid="baz.a-touched">
          {form.touched("baz.a") ? "true" : "false"}
        </pre>

        <pre data-testid="render-count">{renderCounter.current}</pre>
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("foo"));

  await userEvent.click(screen.getByTestId("baz.a"));
  expect(screen.getByTestId("render-count")).toHaveTextContent("2");
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("true");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("foo"));
  expect(screen.getByTestId("render-count")).toHaveTextContent("3");
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("true");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("true");
});
