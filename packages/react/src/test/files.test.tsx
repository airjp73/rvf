import { render, screen } from "@testing-library/react";
import { successValidator } from "./util/successValidator";
import { useRvf } from "../useRvf";
import userEvent from "@testing-library/user-event";

it("should be able to submit file inputs", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        file: undefined as File | undefined,
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()}>
        <input data-testid="file" name="file" type="file" />
        <button data-testid="submit" type="submit" />
      </form>
    );
  };

  render(<TestComp />);

  const file = new File(["test"], "test.txt", { type: "text/plain" });
  await userEvent.upload(screen.getByTestId("file"), file);

  await userEvent.click(screen.getByTestId("submit"));

  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith({ file }, expect.any(FormData));
});

it.todo("should gracefully handle setValue and resetField for file inputs");

it.todo("should not blow up when a file has a default value");
