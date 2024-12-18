import { render, screen } from "@testing-library/react";
import { useRef } from "react";
import { useForm } from "../useForm";
import userEvent from "@testing-library/user-event";
import { successValidator } from "./util/successValidator";
import { controlInput } from "./util/controlInput";

it("should subscribe to changes in the dirty state", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: "",
        baz: { a: "" },
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    const renderCounter = useRef(0);
    renderCounter.current++;

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo").getInputProps()} />
        <pre data-testid="foo-dirty">
          {form.dirty("foo") ? "true" : "false"}
        </pre>

        <input data-testid="baz.a" {...controlInput(form.field("baz.a"))} />
        <pre data-testid="baz.a-dirty">
          {form.dirty("baz.a") ? "true" : "false"}
        </pre>

        <pre data-testid="render-count">{renderCounter.current}</pre>
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
  expect(screen.getByTestId("foo-dirty")).toHaveTextContent("false");
  expect(screen.getByTestId("baz.a-dirty")).toHaveTextContent("false");

  // Dirty foo
  await userEvent.type(screen.getByTestId("foo"), "f");
  expect(screen.getByTestId("render-count")).toHaveTextContent("2");
  expect(screen.getByTestId("foo-dirty")).toHaveTextContent("true");
  expect(screen.getByTestId("baz.a-dirty")).toHaveTextContent("false");

  // No additional updates for more foo changes
  await userEvent.type(screen.getByTestId("foo"), "oobarbaz");
  expect(screen.getByTestId("render-count")).toHaveTextContent("2");
  expect(screen.getByTestId("foo-dirty")).toHaveTextContent("true");
  expect(screen.getByTestId("baz.a-dirty")).toHaveTextContent("false");

  // Type in baz.a (update because controlled)
  await userEvent.type(screen.getByTestId("baz.a"), "baz");
  expect(screen.getByTestId("render-count")).toHaveTextContent("5");
  expect(screen.getByTestId("foo-dirty")).toHaveTextContent("true");
  expect(screen.getByTestId("baz.a-dirty")).toHaveTextContent("true");

  await userEvent.clear(screen.getByTestId("baz.a"));
  await userEvent.clear(screen.getByTestId("foo"));
  expect(screen.getByTestId("foo-dirty")).toHaveTextContent("false");
  expect(screen.getByTestId("baz.a-dirty")).toHaveTextContent("false");
});

it("should keep newly added field array fields dirty", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: [""],
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        {form.array("foo").map((key, item, index) => (
          <div key={key}>
            <input data-testid={`${index}`} {...item.field().getInputProps()} />
            <pre data-testid={`${index}-dirty`}>
              {item.dirty() ? "true" : "false"}
            </pre>
          </div>
        ))}
        <button
          type="button"
          data-testid="add"
          onClick={() => form.array("foo").push("")}
        />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("0-dirty")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("add"));
  expect(screen.getByTestId("0-dirty")).toHaveTextContent("false");
  expect(screen.getByTestId("1-dirty")).toHaveTextContent("false");

  await userEvent.type(screen.getByTestId("0"), "test");
  expect(screen.getByTestId("0-dirty")).toHaveTextContent("true");
  expect(screen.getByTestId("1-dirty")).toHaveTextContent("false");

  await userEvent.type(screen.getByTestId("1"), "test");
  expect(screen.getByTestId("0-dirty")).toHaveTextContent("true");
  expect(screen.getByTestId("1-dirty")).toHaveTextContent("true");

  await userEvent.clear(screen.getByTestId("0"));
  await userEvent.clear(screen.getByTestId("1"));
  expect(screen.getByTestId("0-dirty")).toHaveTextContent("false");
  expect(screen.getByTestId("1-dirty")).toHaveTextContent("false");
});
