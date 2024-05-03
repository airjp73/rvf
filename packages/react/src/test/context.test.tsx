import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RvfProvider, useRvfContext } from "../context";
import { useRvf } from "../react";
import { successValidator } from "./util/successValidator";
import userEvent from "@testing-library/user-event";

const Name = () => {
  const form = useRvfContext<{ name: string }>();
  return (
    <div>
      <input data-testid="name" {...form.field("name")} />
    </div>
  );
};

it("should be possible to use context to access the form", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useRvf({
      defaultValues: { name: "Bob" },
      onSubmit: submit,
      validator: successValidator,
    });

    return (
      <RvfProvider scope={form.scope()}>
        <form {...form.getFormProps()} data-testid="form">
          <Name />
        </form>
      </RvfProvider>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("name")).toHaveValue("Bob");
  await userEvent.type(screen.getByTestId("name"), "test");
  fireEvent.submit(screen.getByTestId("form"));

  await waitFor(() => {
    expect(submit).toHaveBeenCalledTimes(1);
  });
  expect(submit).toHaveBeenCalledWith({ name: "Bobtest" });
});

it("should be possible to scope a context provider", async () => {
  const submit = vi.fn();

  const TestComp = () => {
    const form = useRvf({
      defaultValues: { personA: { name: "Bob" }, personB: { name: "Jane" } },
      onSubmit: submit,
      validator: successValidator,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <RvfProvider scope={form.scope("personA")}>
          <Name />
        </RvfProvider>
        <RvfProvider scope={form.scope("personB")}>
          <Name />
        </RvfProvider>
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
  expect(submit).toHaveBeenCalledWith({
    personA: { name: "Bob Ross" },
    personB: { name: "Jane Doe" },
  });
});
