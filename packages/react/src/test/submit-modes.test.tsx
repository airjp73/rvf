import { render, screen } from "@testing-library/react";
import { useRvf } from "../useRvf";
import { successValidator } from "./util/successValidator";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

it("should use the form itself as the source of truth for `dom` mode", async () => {
  const submit = vi.fn();
  const validator = vi.fn(successValidator);

  const TestComp = () => {
    const form = useRvf({
      submitSource: "dom",
      defaultValues: {
        foo: 123,
      },
      validator,
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" value="456" name="foo" />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);

  await userEvent.click(screen.getByTestId("submit"));
  expect(validator).toHaveBeenCalledTimes(1);
  expect(validator).toHaveBeenCalledWith({ foo: "456" });
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith({ foo: "456" });
});

it.todo("should include data from the form submitter on submit in `dom` mode");

it("should use state as the source of truth for state mode", async () => {
  const submit = vi.fn();
  const validator = vi.fn(successValidator);

  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: 123,
      },
      validator,
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" value="456" name="foo" />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);

  await userEvent.click(screen.getByTestId("submit"));
  expect(validator).toHaveBeenCalledTimes(1);
  expect(validator).toHaveBeenCalledWith({
    foo: 123,
  });
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith({
    foo: 123,
  });
});

it("should respect changes to the submit source", async () => {
  const submit = vi.fn();
  const validator = vi.fn(successValidator);

  const TestComp = () => {
    const [submitSource, setSubmitSource] = useState(
      "state" as "state" | "dom",
    );
    const form = useRvf({
      defaultValues: {
        foo: 123,
      },
      validator,
      handleSubmit: submit,
      submitSource,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" value="456" name="foo" />
        <button
          type="button"
          onClick={() => setSubmitSource("dom")}
          data-testid="switch"
        />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);

  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith({
    foo: 123,
  });

  await userEvent.click(screen.getByTestId("switch"));
  await userEvent.click(screen.getByTestId("submit"));
  expect(submit).toHaveBeenCalledTimes(2);
  expect(submit).toHaveBeenLastCalledWith({
    foo: "456",
  });
});
