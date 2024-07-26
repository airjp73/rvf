import { render, screen } from "@testing-library/react";
import { ValidatedForm } from "../ValidatedForm";
import { RenderCounter } from "./util/RenderCounter";
import { successValidator } from "./util/successValidator";
import userEvent from "@testing-library/user-event";
import { useField } from "../field";
import { Validator } from "@rvf/core";

it("provides a render prop to wire up the form", async () => {
  type DataType = {
    foo: string;
    bar: { a: string };
  };
  const validator = successValidator as Validator<DataType>;
  const submit = vi.fn();

  const TestComp = () => {
    return (
      <ValidatedForm<any, DataType>
        data-testid="form"
        defaultValues={{
          foo: "bar",
          baz: {
            a: "quux",
          },
        }}
        validator={validator}
        handleSubmit={(data, ...rest) => {
          expectTypeOf(data).toEqualTypeOf<DataType>();
          submit(data, ...rest);
        }}
      >
        {(form) => (
          <>
            <input data-testid="foo" {...form.field("foo").getInputProps()} />
            <input
              data-testid="baz.a"
              {...form.field("baz.a").getInputProps()}
            />
            <RenderCounter data-testid="render-count" />
            <button type="submit" data-testid="submit" />
          </>
        )}
      </ValidatedForm>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toHaveValue("bar");
  expect(screen.getByTestId("baz.a")).toHaveValue("quux");
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.type(screen.getByTestId("foo"), "testing 123");
  await userEvent.type(screen.getByTestId("baz.a"), "another value");
  await userEvent.click(screen.getByTestId("submit"));

  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith(
    {
      foo: "bartesting 123",
      baz: {
        a: "quuxanother value",
      },
    },
    expect.any(FormData),
    {},
  );

  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
});

it("automatically provides context", async () => {
  const submit = vi.fn();

  const Field = () => {
    const field = useField<string>("foo");
    return <input data-testid="foo" {...field.getInputProps()} />;
  };

  const TestComp = () => {
    return (
      <ValidatedForm
        data-testid="form"
        defaultValues={{
          foo: "bar",
          baz: {
            a: "quux",
          },
        }}
        validator={successValidator}
        handleSubmit={submit}
      >
        {(form) => (
          <>
            <Field />
            <input
              data-testid="baz.a"
              {...form.field("baz.a").getInputProps()}
            />
            <RenderCounter data-testid="render-count" />
            <button type="submit" data-testid="submit" />
          </>
        )}
      </ValidatedForm>
    );
  };

  render(<TestComp />);
  expect(screen.getByTestId("foo")).toHaveValue("bar");
  expect(screen.getByTestId("baz.a")).toHaveValue("quux");
  expect(screen.getByTestId("render-count")).toHaveTextContent("1");

  await userEvent.type(screen.getByTestId("foo"), "testing 123");
  await userEvent.type(screen.getByTestId("baz.a"), "another value");
  await userEvent.click(screen.getByTestId("submit"));

  expect(submit).toHaveBeenCalledTimes(1);
  expect(submit).toHaveBeenCalledWith(
    {
      foo: "bartesting 123",
      baz: {
        a: "quuxanother value",
      },
    },
    expect.any(FormData),
    {},
  );

  expect(screen.getByTestId("render-count")).toHaveTextContent("1");
});
