import { useRef } from "react";
import { useRvf } from "../react";
import { RenderCounter } from "./util/RenderCounter";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { successValidator } from "./util/successValidator";

it("should be able to isloate rerenders on the fly with `form.isolate(iso => iso.stuff)`", async () => {
  const submit = vi.fn();
  const TestComp = () => {
    const form = useRvf({
      defaultValues: { foo: "bar" },
      validator: successValidator,
      onSubmit: submit,
    });

    const renderCounter = useRef(0);
    renderCounter.current++;

    return (
      <form onSubmit={form.handleSubmit} data-testid="form">
        <input data-testid="foo" {...form.field("foo")} />
        <pre data-testid="foo-touched">
          {form.touched("foo") ? "true" : "false"}
        </pre>
        <RenderCounter data-testid="outer-render-count" />

        {form.isolate((iso) => (
          <>
            <pre data-testid="iso-value">{iso.value("foo")}</pre>
            <RenderCounter data-testid="iso-render-count" />
          </>
        ))}
      </form>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("outer-render-count")).toHaveTextContent("1");
  expect(screen.getByTestId("iso-render-count")).toHaveTextContent("1");
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo")).toHaveValue("bar");
  expect(screen.getByTestId("iso-value")).toHaveTextContent("bar");

  await userEvent.type(screen.getByTestId("foo"), "test");

  expect(screen.getByTestId("outer-render-count")).toHaveTextContent("1");
  expect(screen.getByTestId("iso-render-count")).toHaveTextContent("5");
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo")).toHaveValue("bartest");
  expect(screen.getByTestId("iso-value")).toHaveTextContent("bartest");

  await userEvent.click(screen.getByTestId("outer-render-count")); // blur

  expect(screen.getByTestId("outer-render-count")).toHaveTextContent("2");
  expect(screen.getByTestId("iso-render-count")).toHaveTextContent("6");
  expect(screen.getByTestId("foo-touched")).toHaveTextContent("true");
  expect(screen.getByTestId("foo")).toHaveValue("bartest");
  expect(screen.getByTestId("iso-value")).toHaveTextContent("bartest");
});
