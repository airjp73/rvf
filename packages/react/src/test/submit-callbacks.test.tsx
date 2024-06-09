import { render, screen, waitFor } from "@testing-library/react";
import { useRvf } from "../useRvf";
import { successValidator } from "./util/successValidator";
import userEvent from "@testing-library/user-event";
import { Validator } from "@rvf/core";

it("should call onSubmitSuccess", async () => {
  const submit = vi.fn();
  const submitSuccess = vi.fn();

  const TestComp = () => {
    const form = useRvf({
      submitSource: "dom",
      defaultValues: { foo: 123 },
      validator: successValidator as Validator<{ foo: number }>,

      handleSubmit: async (data) => {
        return {
          bar: "baz",
        };
      },
      onSubmitSuccess: (res) => {
        expectTypeOf(res).toEqualTypeOf<{ bar: string }>();
        submitSuccess(res);
      },
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input readOnly data-testid="foo" value="456" name="foo" />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);

  await userEvent.click(screen.getByTestId("submit"));
  await waitFor(() => {
    expect(submitSuccess).toHaveBeenCalledTimes(1);
  });
  expect(submitSuccess).toHaveBeenCalledWith({ bar: "baz" });
});

it("should call onSubmitFailure", async () => {
  const submitFailure = vi.fn();
  const error = new Error("test");

  const TestComp = () => {
    const form = useRvf({
      defaultValues: { foo: 123 },
      validator: successValidator as Validator<{ foo: 123 }>,

      onSubmitFailure: (err) => {
        submitFailure(err);
      },
      handleSubmit: async () => {
        throw error;
      },
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input readOnly data-testid="foo" value="456" name="foo" />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);

  await userEvent.click(screen.getByTestId("submit"));
  await waitFor(() => {
    expect(submitFailure).toHaveBeenCalledTimes(1);
  });
  expect(submitFailure).toHaveBeenCalledWith(error);
});
