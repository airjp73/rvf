import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRvf } from "../react";
import { successValidator } from "./util/successValidator";

it("should reset the whole form", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "bar",
        baz: { a: "quux" },
      },
      validator: successValidator,
      onSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo")} />
        <pre data-testid="foo-touched">
          {form.touched("foo") ? "true" : "false"}
        </pre>

        <input data-testid="baz.a" {...form.control("baz.a")} />
        <pre data-testid="baz.a-touched">
          {form.touched("baz.a") ? "true" : "false"}
        </pre>

        <button
          type="button"
          data-testid="reset"
          onClick={() => form.resetForm()}
        />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("false");

  await userEvent.type(screen.getByTestId("foo"), "test");
  expect(screen.getByTestId("foo")).toHaveValue("bartest");

  await userEvent.type(screen.getByTestId("baz.a"), "test");
  expect(screen.getByTestId("baz.a")).toHaveValue("quuxtest");
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("true");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("reset"));
  expect(screen.getByTestId("baz.a")).toHaveValue("quux");
  expect(screen.getByTestId("foo")).toHaveValue("bar");
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("false");
});

it("should reset individual fields", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "bar",
        baz: { a: "quux" },
      },
      validator: successValidator,
      onSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo")} />
        <pre data-testid="foo-touched">
          {form.touched("foo") ? "true" : "false"}
        </pre>

        <input data-testid="baz.a" {...form.control("baz.a")} />
        <pre data-testid="baz.a-touched">
          {form.touched("baz.a") ? "true" : "false"}
        </pre>

        <button
          type="button"
          data-testid="reset"
          onClick={() => form.resetField("foo")}
        />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("false");

  await userEvent.type(screen.getByTestId("foo"), "test");
  expect(screen.getByTestId("foo")).toHaveValue("bartest");

  await userEvent.type(screen.getByTestId("baz.a"), "test");
  expect(screen.getByTestId("baz.a")).toHaveValue("quuxtest");
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("true");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("reset"));
  expect(screen.getByTestId("foo")).toHaveValue("bar");
  expect(screen.getByTestId("baz.a")).toHaveValue("quuxtest");
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("true");
});

it("should reset the whole form using custom initial values", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "bar",
        baz: { a: "quux" },
      },
      validator: successValidator,
      onSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo")} />
        <pre data-testid="foo-touched">
          {form.touched("foo") ? "true" : "false"}
        </pre>

        <input data-testid="baz.a" {...form.control("baz.a")} />
        <pre data-testid="baz.a-touched">
          {form.touched("baz.a") ? "true" : "false"}
        </pre>

        <button
          type="button"
          data-testid="reset"
          onClick={() =>
            form.resetForm({
              foo: "testing 123",
              baz: { a: "testing 456" },
            })
          }
        />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("false");

  await userEvent.type(screen.getByTestId("foo"), "test");
  expect(screen.getByTestId("foo")).toHaveValue("bartest");

  await userEvent.type(screen.getByTestId("baz.a"), "test");
  expect(screen.getByTestId("baz.a")).toHaveValue("quuxtest");
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("true");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("reset"));
  expect(screen.getByTestId("foo")).toHaveValue("testing 123");
  expect(screen.getByTestId("baz.a")).toHaveValue("testing 456");
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("false");
});

it("should reset individual fields using custom initial values", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "bar",
        baz: { a: "quux" },
      },
      validator: successValidator,
      onSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo")} />
        <pre data-testid="foo-touched">
          {form.touched("foo") ? "true" : "false"}
        </pre>

        <input data-testid="baz.a" {...form.control("baz.a")} />
        <pre data-testid="baz.a-touched">
          {form.touched("baz.a") ? "true" : "false"}
        </pre>

        <button
          type="button"
          data-testid="reset"
          onClick={() => form.resetField("foo", "testing 123")}
        />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("false");

  await userEvent.type(screen.getByTestId("foo"), "test");
  expect(screen.getByTestId("foo")).toHaveValue("bartest");

  await userEvent.type(screen.getByTestId("baz.a"), "test");
  expect(screen.getByTestId("baz.a")).toHaveValue("quuxtest");
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("true");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("reset"));
  expect(screen.getByTestId("foo")).toHaveValue("testing 123");
  expect(screen.getByTestId("baz.a")).toHaveValue("quuxtest");
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("true");
});

it("should reset the whole form when a reset button is clicked", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: {
        foo: "bar",
        baz: { a: "quux" },
      },
      validator: successValidator,
      onSubmit: submit,
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <input data-testid="foo" {...form.field("foo")} />
        <pre data-testid="foo-touched">
          {form.touched("foo") ? "true" : "false"}
        </pre>

        <input data-testid="baz.a" {...form.control("baz.a")} />
        <pre data-testid="baz.a-touched">
          {form.touched("baz.a") ? "true" : "false"}
        </pre>

        <button type="reset" data-testid="reset" />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("false");

  await userEvent.type(screen.getByTestId("foo"), "test");
  expect(screen.getByTestId("foo")).toHaveValue("bartest");

  await userEvent.type(screen.getByTestId("baz.a"), "test");
  expect(screen.getByTestId("baz.a")).toHaveValue("quuxtest");
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("true");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("reset"));
  expect(screen.getByTestId("baz.a")).toHaveValue("quux");
  expect(screen.getByTestId("foo")).toHaveValue("bar");
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("baz.a-touched")).toHaveTextContent("false");
});
