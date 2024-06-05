import { render, screen } from "@testing-library/react";
import { useRvf } from "../useRvf";
import { successValidator } from "./util/successValidator";
import { useState } from "react";
import userEvent from "@testing-library/user-event";

it("should be able to set the value of an uncontrolled checkbox group when individually registered", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: ["bar", "baz"],
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    const [visible, setVisible] = useState(true);

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input
          data-testid="foo"
          {...form
            .field("foo")
            .getInputProps({ type: "checkbox", value: "foo" })}
        />
        <input
          data-testid="bar"
          {...form
            .field("foo")
            .getInputProps({ type: "checkbox", value: "bar" })}
        />
        <input
          data-testid="baz"
          {...form
            .field("foo")
            .getInputProps({ type: "checkbox", value: "baz" })}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          data-testid="toggle"
        />
        <button
          type="button"
          onClick={() => form.setValue("foo", ["bar", "baz"])}
          data-testid="override-value"
        />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).not.toBeChecked();
  expect(screen.getByTestId("bar")).toBeChecked();
  expect(screen.getByTestId("baz")).toBeChecked();

  await userEvent.click(screen.getByTestId("foo"));
  await userEvent.click(screen.getByTestId("baz"));
  await userEvent.click(screen.getByTestId("bar"));
  expect(screen.getByTestId("foo")).toBeChecked();
  expect(screen.getByTestId("bar")).not.toBeChecked();
  expect(screen.getByTestId("baz")).not.toBeChecked();

  await userEvent.click(screen.getByTestId("toggle"));
  await userEvent.click(screen.getByTestId("toggle"));
  expect(screen.getByTestId("foo")).toBeChecked();
  expect(screen.getByTestId("bar")).not.toBeChecked();
  expect(screen.getByTestId("baz")).not.toBeChecked();

  await userEvent.click(screen.getByTestId("override-value"));
  expect(screen.getByTestId("foo")).not.toBeChecked();
  expect(screen.getByTestId("bar")).toBeChecked();
  expect(screen.getByTestId("baz")).toBeChecked();

  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith(
    {
      foo: ["bar", "baz"],
    },
    expect.any(FormData),
    {},
  );
});
