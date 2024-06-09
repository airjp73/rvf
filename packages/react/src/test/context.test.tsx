import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FormProvider, useFormContext } from "../context";
import { useForm } from "../useForm";
import { successValidator } from "./util/successValidator";
import userEvent from "@testing-library/user-event";

const Name = () => {
  const form = useFormContext<{ name: string }>();
  return (
    <div>
      <input data-testid="name" {...form.field("name").getInputProps()} />
    </div>
  );
};

it("should be possible to use context to access the form", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      defaultValues: { name: "Bob" },
      handleSubmit: submit,
      validator: successValidator,
    });

    return (
      <FormProvider scope={form.scope()}>
        <form {...form.getFormProps()} data-testid="form">
          <Name />
        </form>
      </FormProvider>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("name")).toHaveValue("Bob");
  await userEvent.type(screen.getByTestId("name"), "test");
  fireEvent.submit(screen.getByTestId("form"));

  await waitFor(() => {
    expect(submit).toHaveBeenCalledTimes(1);
  });
  expect(submit).toHaveBeenCalledWith(
    { name: "Bobtest" },
    expect.any(FormData),
    {},
  );
});

it("should be possible to scope a context provider", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      defaultValues: { personA: { name: "Bob" }, personB: { name: "Jane" } },
      handleSubmit: submit,
      validator: successValidator,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <FormProvider scope={form.scope("personA")}>
          <Name />
        </FormProvider>
        <FormProvider scope={form.scope("personB")}>
          <Name />
        </FormProvider>
      </form>
    );
  };

  render(<TestComp />);
  const names = screen.getAllByTestId("name");
  expect(names[0]).toHaveValue("Bob");
  expect(names[1]).toHaveValue("Jane");
  await userEvent.type(names[0], " Ross");
  await userEvent.type(names[1], " Doe");

  fireEvent.submit(screen.getByTestId("form"));

  await waitFor(() => {
    expect(submit).toHaveBeenCalledTimes(1);
  });
  expect(submit).toHaveBeenCalledWith(
    {
      personA: { name: "Bob Ross" },
      personB: { name: "Jane Doe" },
    },
    expect.any(FormData),
    {},
  );
});
