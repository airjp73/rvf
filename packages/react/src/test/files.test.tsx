import { render, screen } from "@testing-library/react";
import { successValidator } from "./util/successValidator";
import { useForm } from "../useForm";
import userEvent from "@testing-library/user-event";

it("should be able to submit file inputs", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
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
  expect(submit).toHaveBeenCalledWith({ file }, expect.any(FormData), {});
});

it("should be able to reset file inputs", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        file: "",
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()}>
        <input
          data-testid="file"
          {...form.field("file").getInputProps({ type: "file" })}
        />
        <pre data-testid="file-value">{JSON.stringify(form.value("file"))}</pre>
        <button type="reset" data-testid="reset" />
        <button data-testid="submit" type="submit" />
      </form>
    );
  };

  render(<TestComp />);

  const file = new File(["test"], "test.txt", { type: "text/plain" });
  const fileInput = screen.getByTestId("file") as HTMLInputElement;
  await userEvent.upload(fileInput, file);
  expect(fileInput.files).toHaveLength(1);
  expect(screen.getByTestId("file-value")).toHaveTextContent(file.name);

  await userEvent.click(screen.getByTestId("reset"));
  expect(fileInput.files).toHaveLength(0);
});

it("should not blow up when a file has a default value", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        file: "hi",
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} encType="multipart/form-data">
        <input
          data-testid="file"
          {...form.getInputProps("file", { type: "file" })}
        />
        <button data-testid="submit" type="submit" />
      </form>
    );
  };

  render(<TestComp />);

  const file = new File(["test"], "test.txt", { type: "text/plain" });
  await userEvent.upload(screen.getByTestId("file"), file);

  await userEvent.click(screen.getByTestId("submit"));

  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith({ file }, expect.any(FormData), {});
});

it("should be possible to observe and clear the value of a file input", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        file: "",
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} encType="multipart/form-data">
        <input
          data-testid="file"
          {...form.getInputProps("file", { type: "file" })}
        />
        <pre data-testid="file-value">{JSON.stringify(form.value("file"))}</pre>
        <button
          data-testid="clear"
          type="button"
          onClick={() => form.setValue("file", "")}
        />
        <button data-testid="submit" type="submit" />
      </form>
    );
  };

  render(<TestComp />);

  const file = new File(["test"], "test.txt", { type: "text/plain" });
  await userEvent.upload(screen.getByTestId("file"), file);
  expect(screen.getByTestId("file-value")).toHaveTextContent(
    JSON.stringify(file),
  );

  await userEvent.click(screen.getByTestId("clear"));
  expect(screen.getByTestId("file-value")).toHaveTextContent('""');
});

it("should be possible to observe and clear the value of a multi-file input", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        file: "",
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} encType="multipart/form-data">
        <input
          data-testid="file"
          {...form.getInputProps("file", { type: "file" })}
          multiple
        />
        <pre data-testid="file-value">{JSON.stringify(form.value("file"))}</pre>
        <button
          data-testid="clear"
          type="button"
          onClick={() => form.setValue("file", "")}
        />
        <button data-testid="submit" type="submit" />
      </form>
    );
  };

  render(<TestComp />);

  const file = new File(["test"], "test.txt", { type: "text/plain" });
  await userEvent.upload(screen.getByTestId("file"), file);
  expect(screen.getByTestId("file-value")).toHaveTextContent(
    JSON.stringify(file),
  );

  await userEvent.click(screen.getByTestId("clear"));
  expect(screen.getByTestId("file-value")).toHaveTextContent('""');
});
