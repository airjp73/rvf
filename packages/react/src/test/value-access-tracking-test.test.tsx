import { render, screen } from "@testing-library/react";
import { useForm } from "../useForm";
import userEvent from "@testing-library/user-event";
import { RenderCounter } from "./util/RenderCounter";
import { useEffect } from "react";
import { successValidator } from "./util/successValidator";

it("should subscribe to value changes", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: "bar",
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <form>
        <pre data-testid="value">{form.value("foo")}</pre>
        <button
          type="button"
          data-testid="set-foo"
          onClick={() => form.setValue("foo", "test")}
        >
          Set foo
        </button>
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("value")).toHaveTextContent("bar");
  await userEvent.click(screen.getByTestId("set-foo"));
  expect(screen.getByTestId("value")).toHaveTextContent("test");
});

it("should only subscribe to the value that was changed even if it's nested", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: {
          bar: "bar",
          baz: "baz",
        },
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <form>
        <RenderCounter data-testid="render-count" />
        <pre data-testid="value">{form.value("foo.bar")}</pre>
        <button
          type="button"
          data-testid="set-foo.bar"
          onClick={() => form.setValue("foo.bar", "test")}
        />
        <button
          type="button"
          data-testid="set-foo.baz"
          onClick={() => form.setValue("foo.baz", "test")}
        />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("value")).toHaveTextContent("bar");
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.click(screen.getByTestId("set-foo.baz"));
  expect(screen.getByTestId("value")).toHaveTextContent("bar");
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.click(screen.getByTestId("set-foo.bar"));
  expect(screen.getByTestId("value")).toHaveTextContent("test");
  expect(screen.getByTestId("render-count")).toHaveTextContent("2");
});

it("should still function correctly if the call to `value` just returns the whole object", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: {
          bar: "bar",
          baz: "baz",
        },
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    return (
      <form>
        <RenderCounter data-testid="render-count" />
        <pre data-testid="value">{form.value().foo.bar}</pre>
        <button
          type="button"
          data-testid="set-foo.bar"
          onClick={() => form.setValue("foo.bar", "test")}
        />
        <button
          type="button"
          data-testid="set-foo.baz"
          onClick={() => form.setValue("foo.baz", "test")}
        />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("value")).toHaveTextContent("bar");
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.click(screen.getByTestId("set-foo.baz"));
  expect(screen.getByTestId("value")).toHaveTextContent("bar");
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.click(screen.getByTestId("set-foo.bar"));
  expect(screen.getByTestId("value")).toHaveTextContent("test");
  expect(screen.getByTestId("render-count")).toHaveTextContent("2");
});

it("should be possible to access a value in an effect without rerendering", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: "bar",
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    useEffect(() => {
      form.value("foo");
    }, [form]);

    return (
      <form>
        <pre data-testid="value">{form.value("foo")}</pre>
        <button
          type="button"
          data-testid="set-foo"
          onClick={() => form.setValue("foo", "test")}
        />
        <RenderCounter data-testid="render-count" />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("value")).toHaveTextContent("bar");
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
  userEvent.click(screen.getByTestId("set-foo"));
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
});

it("should be possible to set a value using a value returned from the value helper", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: { value: "bar" },
        bar: { value: "" },
      },
      validator: successValidator,
      handleSubmit: submit,
    });

    const value = form.value("foo");

    return (
      <form>
        <pre data-testid="value">{form.value("bar.value")}</pre>
        <button
          type="button"
          data-testid="set-bar"
          onClick={() => form.setValue("bar", value)}
        />
        <RenderCounter data-testid="render-count" />
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("value")).toBeEmptyDOMElement();
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
  await userEvent.click(screen.getByTestId("set-bar"));
  expect(screen.getByTestId("value")).toHaveTextContent("bar");
  expect(screen.getByTestId("render-count")).toHaveTextContent("2");
});
