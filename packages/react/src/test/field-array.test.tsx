import { render, renderHook, screen, waitFor } from "@testing-library/react";
import { useForm } from "../useForm";
import userEvent from "@testing-library/user-event";
import { Fragment } from "react/jsx-runtime";
import { RenderCounter } from "./util/RenderCounter";
import { describe, expect, it, vi } from "vitest";
import { successValidator } from "./util/successValidator";
import { controlInput } from "./util/controlInput";
import { FieldArray, useFieldArray } from "../array";
import { FormProvider } from "../context";
import { FieldErrors, FormScope, createValidator } from "@rvf/core";
import { ComponentProps, useState } from "react";
import { useFormScope } from "../useFormScope";
import { useField } from "../field";

it("should only accept array values", () => {
  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: ["bar"],
        bar: "bar",
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    form.array("foo");

    const arrForm = useFormScope(form.scope("foo"));
    arrForm.array();

    // @ts-expect-error
    form.array();

    // @ts-expect-error
    form.array("bar");
  };
});

it("should be able to reduce array values", async () => {
  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: [{ val: 0 }, { val: 1 }, { val: 2 }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <pre data-testid="value">
          {form.value("foo").reduce((agg, item) => agg + item.val, 0)}
        </pre>
      </form>
    );
  };

  render(<Comp />);
  expect(screen.getByTestId("value")).toHaveTextContent("3");
});

it("should be able to return any data from `map` operation", async () => {
  const res = renderHook(() => {
    const form = useForm({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return form.array("foo").map((key, item, index) => {
      return item.value("name");
    });
  });

  expect(res.result.current).toEqual(["bar", "baz"]);
});

describe("controlled items", () => {
  it("should render every item in the array", async () => {
    const Comp = () => {
      const form = useForm({
        defaultValues: {
          foo: [{ name: "bar" }, { name: "baz" }],
        },
        validator: successValidator,
        handleSubmit: vi.fn(),
      });

      return (
        <form {...form.getFormProps()}>
          {form.array("foo").map((key, item, index) => {
            return (
              <input
                key={key}
                data-testid={`foo-${index}`}
                {...controlInput(item.field("name"))}
              />
            );
          })}
        </form>
      );
    };

    render(<Comp />);
    expect(screen.getByTestId("foo-0")).toHaveValue("bar");
    expect(screen.getByTestId("foo-1")).toHaveValue("baz");

    await userEvent.type(screen.getByTestId("foo-0"), "test");
    expect(screen.getByTestId("foo-0")).toHaveValue("bartest");
  });

  it("should work with non-object array values", async () => {
    const Comp = () => {
      const form = useForm({
        defaultValues: {
          foo: ["bar", "baz"],
        },
        validator: successValidator,
        handleSubmit: vi.fn(),
      });

      return (
        <form {...form.getFormProps()}>
          {form.array("foo").map((key, item, index) => (
            <Fragment key={key}>
              <input
                data-testid={`foo-${index}`}
                {...controlInput(item.field())}
              />
              <RenderCounter data-testid={`foo-${index}-render-count`} />
            </Fragment>
          ))}
          <RenderCounter data-testid="root-render-count" />
        </form>
      );
    };

    render(<Comp />);
    expect(
      screen.getByTestId("root-render-count").textContent,
    ).toMatchInlineSnapshot(`"1"`);
    expect(screen.getByTestId("foo-0")).toHaveValue("bar");
    expect(
      screen.getByTestId("foo-0-render-count").textContent,
    ).toMatchInlineSnapshot(`"1"`);
    expect(screen.getByTestId("foo-1")).toHaveValue("baz");
    expect(
      screen.getByTestId("foo-1-render-count").textContent,
    ).toMatchInlineSnapshot(`"1"`);

    await userEvent.type(screen.getByTestId("foo-0"), "test");
    expect(
      screen.getByTestId("root-render-count").textContent,
    ).toMatchInlineSnapshot(`"5"`);
    expect(screen.getByTestId("foo-0")).toHaveValue("bartest");
    expect(
      screen.getByTestId("foo-0-render-count").textContent,
    ).toMatchInlineSnapshot(`"5"`);
    expect(screen.getByTestId("foo-1")).toHaveValue("baz");
    expect(
      screen.getByTestId("foo-1-render-count").textContent,
    ).toMatchInlineSnapshot(`"5"`);
  });
});

describe("uncontrolled items", () => {
  it("should render every item in the array", async () => {
    const Comp = () => {
      const form = useForm({
        defaultValues: {
          foo: [{ name: "bar" }, { name: "baz" }],
        },
        validator: successValidator,
        handleSubmit: vi.fn(),
      });

      return (
        <form {...form.getFormProps()}>
          {form.array("foo").map((key, item, index) => (
            <input
              key={key}
              data-testid={`foo-${index}`}
              {...item.field("name").getInputProps()}
            />
          ))}
        </form>
      );
    };

    render(<Comp />);
    expect(screen.getByTestId("foo-0")).toHaveValue("bar");
    expect(screen.getByTestId("foo-1")).toHaveValue("baz");

    await userEvent.type(screen.getByTestId("foo-0"), "test");
    expect(screen.getByTestId("foo-0")).toHaveValue("bartest");
  });

  it("should work with the component version of FieldArray", async () => {
    const Comp = () => {
      const form = useForm({
        defaultValues: {
          foo: [{ name: "bar" }, { name: "baz" }],
        },
        validator: successValidator,
        handleSubmit: vi.fn(),
      });

      return (
        <form {...form.getFormProps()}>
          <FieldArray scope={form.scope("foo")}>
            {(array) =>
              array.map((key, item, index) => (
                <input
                  key={key}
                  data-testid={`foo-${index}`}
                  {...item.field("name").getInputProps()}
                />
              ))
            }
          </FieldArray>
        </form>
      );
    };

    render(<Comp />);
    expect(screen.getByTestId("foo-0")).toHaveValue("bar");
    expect(screen.getByTestId("foo-1")).toHaveValue("baz");

    await userEvent.type(screen.getByTestId("foo-0"), "test");
    expect(screen.getByTestId("foo-0")).toHaveValue("bartest");
  });

  it("should correctly set default values when adding items", async () => {
    const Comp = () => {
      const form = useForm({
        defaultValues: {
          foo: [{ name: "bar" }, { name: "baz" }],
        },
        validator: successValidator,
        handleSubmit: vi.fn(),
      });

      return (
        <form {...form.getFormProps()}>
          {form.array("foo").map((key, item, index) => {
            return (
              <input
                key={key}
                data-testid={`foo-${index}`}
                {...item.field("name").getInputProps()}
              />
            );
          })}
          <button
            type="button"
            data-testid="push"
            onClick={() => {
              const arr = form.array("foo");
              arr.pop();
              arr.push({ name: "quux" });
            }}
          />
        </form>
      );
    };

    render(<Comp />);
    expect(screen.getByTestId("foo-0")).toHaveValue("bar");
    expect(screen.getByTestId("foo-1")).toHaveValue("baz");

    await userEvent.click(screen.getByTestId("push"));
    expect(screen.getByTestId("foo-1")).toHaveValue("quux");
  });

  it("should work with non-object array values", async () => {
    const Comp = () => {
      const form = useForm({
        defaultValues: {
          foo: ["bar", "baz"],
        },
        validator: successValidator,
        handleSubmit: vi.fn(),
      });

      return (
        <div>
          {form.array("foo").map((key, item, index) => (
            <Fragment key={key}>
              <input
                data-testid={`foo-${index}`}
                {...item.field().getInputProps()}
              />
              <RenderCounter data-testid={`foo-${index}-render-count`} />
            </Fragment>
          ))}
          <RenderCounter data-testid="root-render-count" />
        </div>
      );
    };

    render(<Comp />);
    expect(
      screen.getByTestId("root-render-count").textContent,
    ).toMatchInlineSnapshot(`"1"`);
    expect(screen.getByTestId("foo-0")).toHaveValue("bar");
    expect(
      screen.getByTestId("foo-0-render-count").textContent,
    ).toMatchInlineSnapshot(`"1"`);
    expect(screen.getByTestId("foo-1")).toHaveValue("baz");
    expect(
      screen.getByTestId("foo-1-render-count").textContent,
    ).toMatchInlineSnapshot(`"1"`);

    await userEvent.type(screen.getByTestId("foo-0"), "test");
    expect(
      screen.getByTestId("root-render-count").textContent,
    ).toMatchInlineSnapshot(`"1"`);
    expect(screen.getByTestId("foo-0")).toHaveValue("bartest");
    expect(
      screen.getByTestId("foo-0-render-count").textContent,
    ).toMatchInlineSnapshot(`"1"`);
    expect(screen.getByTestId("foo-1")).toHaveValue("baz");
    expect(
      screen.getByTestId("foo-1-render-count").textContent,
    ).toMatchInlineSnapshot(`"1"`);
  });
});

it("should work with a pre-scoped form", async () => {
  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });
    const array = useFormScope(form.scope("foo"));

    return (
      <form {...form.getFormProps()}>
        {array.array().map((key, item, index) => {
          return (
            <input
              key={key}
              data-testid={`foo-${index}`}
              {...controlInput(item.field("name"))}
            />
          );
        })}
      </form>
    );
  };

  render(<Comp />);
  expect(screen.getByTestId("foo-0")).toHaveValue("bar");
  expect(screen.getByTestId("foo-1")).toHaveValue("baz");

  await userEvent.type(screen.getByTestId("foo-0"), "test");
  expect(screen.getByTestId("foo-0")).toHaveValue("bartest");
});

it("should memoize array object creation", async () => {
  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    expect(form.array("foo")).toBe(form.array("foo"));

    return null;
  };

  render(<Comp />);
});

it("should be able to push to an array", async () => {
  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <form {...form.getFormProps()}>
        {form.array("foo").map((key, item, index) => {
          return (
            <input
              key={key}
              data-testid={`foo-${index}`}
              {...controlInput(item.field("name"))}
            />
          );
        })}
        <button
          type="button"
          data-testid="push"
          onClick={() => form.array("foo").push({ name: "quux" })}
        />
      </form>
    );
  };

  render(<Comp />);
  expect(screen.getByTestId("foo-0")).toHaveValue("bar");
  expect(screen.getByTestId("foo-1")).toHaveValue("baz");
  expect(screen.queryByTestId("foo-2")).not.toBeInTheDocument();

  await userEvent.click(screen.getByTestId("push"));
  expect(screen.getByTestId("foo-2")).toHaveValue("quux");
});

it("should be able to pop from an array", async () => {
  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <form {...form.getFormProps()}>
        {form.array("foo").map((key, item, index) => {
          return (
            <input
              key={key}
              data-testid={`foo-${index}`}
              {...controlInput(item.field("name"))}
            />
          );
        })}
        <button
          type="button"
          data-testid="pop"
          onClick={() => form.array("foo").pop()}
        />
      </form>
    );
  };

  render(<Comp />);
  expect(screen.getByTestId("foo-0")).toHaveValue("bar");
  expect(screen.getByTestId("foo-1")).toHaveValue("baz");

  await userEvent.click(screen.getByTestId("pop"));
  expect(screen.getByTestId("foo-0")).toHaveValue("bar");
  expect(screen.queryByTestId("foo-1")).not.toBeInTheDocument();
});

it("should be able to shift from an array", async () => {
  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <form {...form.getFormProps()}>
        {form.array("foo").map((key, item, index) => {
          return (
            <div key={key}>
              <input
                data-testid={`foo-${index}`}
                {...controlInput(item.field("name"))}
              />
              <pre data-testid={`foo-${index}-touched`}>
                {item.touched("name") ? "true" : "false"}
              </pre>
            </div>
          );
        })}
        <button
          type="button"
          data-testid="shift"
          onClick={() => form.array("foo").shift()}
        />
      </form>
    );
  };

  render(<Comp />);
  expect(screen.getByTestId("foo-0")).toHaveValue("bar");
  expect(screen.getByTestId("foo-1")).toHaveValue("baz");

  await userEvent.click(screen.getByTestId("foo-0"));
  await userEvent.click(screen.getByTestId("foo-0-touched"));

  expect(screen.getByTestId("foo-0-touched")).toHaveTextContent("true");
  expect(screen.getByTestId("foo-1-touched")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("shift"));
  expect(screen.getByTestId("foo-0")).toHaveValue("baz");
  expect(screen.queryByTestId("foo-1")).not.toBeInTheDocument();

  // The touched field was shifted out of the array, leaving the untouched filed as the first one
  expect(screen.getByTestId("foo-0-touched")).toHaveTextContent("false");
});

it("should be able to unshift to an array", async () => {
  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <form {...form.getFormProps()}>
        {form.array("foo").map((key, item, index) => {
          return (
            <div key={key}>
              <input
                data-testid={`foo-${index}`}
                {...controlInput(item.field("name"))}
              />
              <pre data-testid={`foo-${index}-touched`}>
                {item.touched("name") ? "true" : "false"}
              </pre>
            </div>
          );
        })}
        <button
          type="button"
          data-testid="unshift"
          onClick={() => form.array("foo").unshift({ name: "quux" })}
        />
      </form>
    );
  };

  render(<Comp />);
  expect(screen.getByTestId("foo-0")).toHaveValue("bar");
  expect(screen.getByTestId("foo-1")).toHaveValue("baz");

  await userEvent.click(screen.getByTestId("foo-0"));
  await userEvent.click(screen.getByTestId("foo-0-touched"));

  expect(screen.getByTestId("foo-0-touched")).toHaveTextContent("true");
  expect(screen.getByTestId("foo-1-touched")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("unshift"));
  expect(screen.getByTestId("foo-0")).toHaveValue("quux");
  expect(screen.getByTestId("foo-1")).toHaveValue("bar");
  expect(screen.getByTestId("foo-2")).toHaveValue("baz");

  expect(screen.getByTestId("foo-0-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-1-touched")).toHaveTextContent("true");
  expect(screen.getByTestId("foo-2-touched")).toHaveTextContent("false");
});

it("should be able to insert into an array", async () => {
  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <form {...form.getFormProps()}>
        {form.array("foo").map((key, item, index) => {
          return (
            <div key={key}>
              <input
                key={key}
                data-testid={`foo-${index}`}
                {...controlInput(item.field("name"))}
              />
              <pre data-testid={`foo-${index}-touched`}>
                {item.touched("name") ? "true" : "false"}
              </pre>
            </div>
          );
        })}
        <button
          type="button"
          data-testid="insert"
          onClick={() => form.array("foo").insert(1, { name: "quux" })}
        />
      </form>
    );
  };

  render(<Comp />);
  expect(screen.getByTestId("foo-0")).toHaveValue("bar");
  expect(screen.getByTestId("foo-0-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-1")).toHaveValue("baz");
  expect(screen.getByTestId("foo-1-touched")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("foo-1"));
  await userEvent.click(screen.getByTestId("foo-1-touched"));

  await userEvent.click(screen.getByTestId("insert"));
  expect(screen.getByTestId("foo-0")).toHaveValue("bar");
  expect(screen.getByTestId("foo-0-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-1")).toHaveValue("quux");
  expect(screen.getByTestId("foo-1-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-2")).toHaveValue("baz");
  expect(screen.getByTestId("foo-2-touched")).toHaveTextContent("true");
});

it("should be able to move within an array", async () => {
  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }, { name: "quux" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <form {...form.getFormProps()}>
        {form.array("foo").map((key, item, index) => {
          return (
            <div key={key}>
              <input
                key={key}
                data-testid={`foo-${index}`}
                {...controlInput(item.field("name"))}
              />
              <pre data-testid={`foo-${index}-touched`}>
                {item.touched("name") ? "true" : "false"}
              </pre>
            </div>
          );
        })}
        <button
          type="button"
          data-testid="move"
          onClick={() => form.array("foo").move(0, 1)}
        />
      </form>
    );
  };

  render(<Comp />);
  expect(screen.getByTestId("foo-0")).toHaveValue("bar");
  expect(screen.getByTestId("foo-0-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-1")).toHaveValue("baz");
  expect(screen.getByTestId("foo-1-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-2")).toHaveValue("quux");
  expect(screen.getByTestId("foo-2-touched")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("foo-1"));
  await userEvent.click(screen.getByTestId("foo-1-touched"));

  expect(screen.getByTestId("foo-0")).toHaveValue("bar");
  expect(screen.getByTestId("foo-0-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-1")).toHaveValue("baz");
  expect(screen.getByTestId("foo-1-touched")).toHaveTextContent("true");
  expect(screen.getByTestId("foo-2")).toHaveValue("quux");
  expect(screen.getByTestId("foo-2-touched")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("move"));
  expect(screen.getByTestId("foo-0")).toHaveValue("baz");
  expect(screen.getByTestId("foo-0-touched")).toHaveTextContent("true");
  expect(screen.getByTestId("foo-1")).toHaveValue("bar");
  expect(screen.getByTestId("foo-1-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-2")).toHaveValue("quux");
  expect(screen.getByTestId("foo-2-touched")).toHaveTextContent("false");
});

it("should be able to swap within an array", async () => {
  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }, { name: "quux" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <form {...form.getFormProps()}>
        {form.array("foo").map((key, item, index) => {
          return (
            <div key={key}>
              <input
                key={key}
                data-testid={`foo-${index}`}
                {...controlInput(item.field("name"))}
              />
              <pre data-testid={`foo-${index}-touched`}>
                {item.touched("name") ? "true" : "false"}
              </pre>
            </div>
          );
        })}
        <button
          type="button"
          data-testid="swap"
          onClick={() => form.array("foo").swap(0, 2)}
        />
      </form>
    );
  };

  render(<Comp />);
  expect(screen.getByTestId("foo-0")).toHaveValue("bar");
  expect(screen.getByTestId("foo-0-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-1")).toHaveValue("baz");
  expect(screen.getByTestId("foo-1-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-2")).toHaveValue("quux");
  expect(screen.getByTestId("foo-2-touched")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("foo-0"));
  await userEvent.click(screen.getByTestId("foo-0-touched"));

  await userEvent.click(screen.getByTestId("swap"));
  expect(screen.getByTestId("foo-0")).toHaveValue("quux");
  expect(screen.getByTestId("foo-0-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-1")).toHaveValue("baz");
  expect(screen.getByTestId("foo-1-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-2")).toHaveValue("bar");
  expect(screen.getByTestId("foo-2-touched")).toHaveTextContent("true");
});

it("should be able to remove from an array", async () => {
  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }, { name: "quux" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <form {...form.getFormProps()}>
        {form.array("foo").map((key, item, index) => {
          return (
            <div key={key}>
              <input
                key={key}
                data-testid={`foo-${index}`}
                {...controlInput(item.field("name"))}
              />
              <pre data-testid={`foo-${index}-touched`}>
                {item.touched("name") ? "true" : "false"}
              </pre>
            </div>
          );
        })}
        <button
          type="button"
          data-testid="remove"
          onClick={() => form.array("foo").remove(1)}
        />
      </form>
    );
  };

  render(<Comp />);
  expect(screen.getByTestId("foo-0")).toHaveValue("bar");
  expect(screen.getByTestId("foo-0-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-1")).toHaveValue("baz");
  expect(screen.getByTestId("foo-1-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-2")).toHaveValue("quux");
  expect(screen.getByTestId("foo-2-touched")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("foo-2"));
  await userEvent.click(screen.getByTestId("foo-2-touched"));

  await userEvent.click(screen.getByTestId("remove"));
  expect(screen.getByTestId("foo-0")).toHaveValue("bar");
  expect(screen.getByTestId("foo-0-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-1")).toHaveValue("quux");
  expect(screen.getByTestId("foo-1-touched")).toHaveTextContent("true");
});

it("should be able to replace", async () => {
  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }, { name: "quux" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <form {...form.getFormProps()}>
        {form.array("foo").map((key, item, index) => {
          return (
            <div key={key}>
              <input
                key={key}
                data-testid={`foo-${index}`}
                {...controlInput(item.field("name"))}
              />
              <pre data-testid={`foo-${index}-touched`}>
                {item.touched("name") ? "true" : "false"}
              </pre>
            </div>
          );
        })}
        <button
          type="button"
          data-testid="replace"
          onClick={() => form.array("foo").replace(1, { name: "jimbo" })}
        />
      </form>
    );
  };

  render(<Comp />);
  expect(screen.getByTestId("foo-0")).toHaveValue("bar");
  expect(screen.getByTestId("foo-0-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-1")).toHaveValue("baz");
  expect(screen.getByTestId("foo-1-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-2")).toHaveValue("quux");
  expect(screen.getByTestId("foo-2-touched")).toHaveTextContent("false");

  await userEvent.click(screen.getByTestId("foo-1"));
  await userEvent.click(screen.getByTestId("foo-1-touched"));

  await userEvent.click(screen.getByTestId("replace"));
  expect(screen.getByTestId("foo-0")).toHaveValue("bar");
  expect(screen.getByTestId("foo-0-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-1")).toHaveValue("jimbo");
  expect(screen.getByTestId("foo-1-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-2")).toHaveValue("quux");
  expect(screen.getByTestId("foo-2-touched")).toHaveTextContent("false");
});

it("should default to an empty array if no default value is provided", async () => {
  let id = 0;
  const Comp = () => {
    const form = useForm({
      validator: createValidator({
        validate: (data) => {
          const errors: FieldErrors = {};
          (data.foo as { name: string }[])?.forEach((item, index) => {
            if ((item?.name?.length ?? 0) < 3)
              errors[`foo[${index}]`] = "too short";
          });
          if (Object.keys(errors).length > 0)
            return Promise.resolve({
              error: errors,
              data: undefined,
            });
          return Promise.resolve({ data, error: undefined });
        },
      }),
      handleSubmit: vi.fn(),
    });

    return (
      <FormProvider scope={form.scope()}>
        <form {...form.getFormProps()}>
          <FieldArray name="foo">
            {({ map, push, remove }) => (
              <>
                {map((key, item, index) => {
                  return (
                    <div key={key}>
                      <input
                        key={key}
                        data-testid={`foo-${index}`}
                        name={`foo[${index}].name`}
                      />
                      <button
                        type="button"
                        data-testid={`remove-foo-${index}`}
                        onClick={() => remove(index)}
                      />
                    </div>
                  );
                })}
                <button
                  type="button"
                  data-testid="push"
                  onClick={() => push({ id: id++ })}
                />
              </>
            )}
          </FieldArray>
          <button type="submit" data-testid="submit" />
        </form>
      </FormProvider>
    );
  };

  render(<Comp />);
  await userEvent.click(screen.getByTestId("push"));
  expect(screen.getByTestId("foo-0")).toHaveValue("");

  await userEvent.click(screen.getByTestId("push"));
  expect(screen.getByTestId("foo-1")).toHaveValue("");

  await userEvent.click(screen.getByTestId("push"));
  expect(screen.getByTestId("foo-2")).toHaveValue("");

  await userEvent.click(screen.getByTestId("submit"));

  await userEvent.type(screen.getByTestId("foo-0"), "hello");
  await userEvent.type(screen.getByTestId("foo-1"), "bye");
  await userEvent.type(screen.getByTestId("foo-2"), "bye");
  await userEvent.click(screen.getByTestId("remove-foo-1"));

  expect(screen.queryByTestId("foo-2")).not.toBeInTheDocument();
  expect(screen.getByTestId("foo-1")).toHaveValue("bye");
});

it("should handle nested field arrays", async () => {
  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: [{ name: "bar", notes: [{ text: "baz" }] }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <form {...form.getFormProps()}>
        {form.array("foo").map((key, fooItem, index) => (
          <div key={key}>
            <input
              data-testid={`foo-${index}-name`}
              {...fooItem.field("name").getInputProps()}
            />

            {fooItem.array("notes").map((key, noteItem, noteIndex) => (
              <div key={key}>
                <input
                  data-testid={`foo-${index}-note-${noteIndex}-text`}
                  {...noteItem.field("text").getInputProps()}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                fooItem.array("notes").push({
                  text: "",
                })
              }
              data-testid={`foo-${index}-add-note`}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            form.array("foo").push({
              name: "",
              notes: [{ text: "" }],
            })
          }
          data-testid="add-foo"
        />

        <button
          type="button"
          onClick={() => form.array("foo").swap(1, 2)}
          data-testid="swap-foo"
        />
      </form>
    );
  };

  render(<Comp />);

  await userEvent.click(screen.getByTestId("add-foo"));
  await userEvent.click(screen.getByTestId("add-foo"));

  // foo-0 has defaults

  await userEvent.type(screen.getByTestId("foo-1-name"), "foo-1");
  await userEvent.type(screen.getByTestId("foo-1-note-0-text"), "foo-1-note-0");
  await userEvent.click(screen.getByTestId("foo-1-add-note"));
  await userEvent.type(screen.getByTestId("foo-1-note-1-text"), "foo-1-note-1");

  await userEvent.type(screen.getByTestId("foo-2-name"), "foo-2");
  await userEvent.type(screen.getByTestId("foo-2-note-0-text"), "foo-2-note-0");

  expect(screen.getByTestId("foo-0-name")).toHaveValue("bar");
  expect(screen.getByTestId("foo-0-note-0-text")).toHaveValue("baz");
  expect(screen.getByTestId("foo-1-name")).toHaveValue("foo-1");
  expect(screen.getByTestId("foo-1-note-0-text")).toHaveValue("foo-1-note-0");
  expect(screen.getByTestId("foo-1-note-1-text")).toHaveValue("foo-1-note-1");
  expect(screen.getByTestId("foo-2-name")).toHaveValue("foo-2");
  expect(screen.getByTestId("foo-2-note-0-text")).toHaveValue("foo-2-note-0");

  await userEvent.click(screen.getByTestId("swap-foo"));
  expect(screen.getByTestId("foo-0-name")).toHaveValue("bar");
  expect(screen.getByTestId("foo-0-note-0-text")).toHaveValue("baz");
  expect(screen.getByTestId("foo-1-name")).toHaveValue("foo-2");
  expect(screen.getByTestId("foo-1-note-0-text")).toHaveValue("foo-2-note-0");
  expect(screen.queryByTestId("foo-1-note-1-text")).not.toBeInTheDocument();
  expect(screen.getByTestId("foo-2-name")).toHaveValue("foo-1");
  expect(screen.getByTestId("foo-2-note-0-text")).toHaveValue("foo-1-note-0");
  expect(screen.getByTestId("foo-2-note-1-text")).toHaveValue("foo-1-note-1");
});

it("should validate on submit, then on change after that by default", async () => {
  const Comp = () => {
    const form = useForm({
      submitSource: "state",
      defaultValues: {
        foo: [] as string[],
      },
      validator: createValidator({
        validate: (d) => {
          const data: { foo: string[] } = d as any;
          const errors: FieldErrors = {};
          if (data.foo.length < 3) errors.foo = "too short";
          data.foo.forEach((val, index) => {
            if (val) errors[`foo[${index}]`] = "too short";
          });
          if (Object.keys(errors).length > 0)
            return Promise.resolve({ error: errors, data: undefined });
          return Promise.resolve({ data, error: undefined });
        },
      }),
      handleSubmit: vi.fn(),
    });

    return (
      <form {...form.getFormProps()}>
        <div data-testid="array-error">{form.error("foo")}</div>
        {form.array("foo").map((key, item, index) => {
          return (
            <div key={key}>
              <input
                data-testid={`foo-${index}`}
                {...controlInput(item.field())}
              />
              <div data-testid={`foo-${index}-error`}>{item.error()}</div>
              <button
                data-testid={`foo-${index}-remove`}
                type="button"
                onClick={() => form.array("foo").remove(index)}
              >
                Remove
              </button>
            </div>
          );
        })}
        <button
          type="button"
          data-testid="add"
          onClick={() => form.array("foo").push("jo")}
        />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<Comp />);
  await userEvent.click(screen.getByTestId("add"));
  await userEvent.click(screen.getByTestId("add"));

  expect(screen.queryAllByText("too short")).toHaveLength(0);
  await userEvent.click(screen.getByTestId("submit"));
  expect(screen.getAllByText("too short")).toHaveLength(3);

  await userEvent.click(screen.getByTestId("add"));
  expect(screen.getByTestId("array-error")).toBeEmptyDOMElement();
  expect(screen.getAllByText("too short")).toHaveLength(3);

  await userEvent.click(screen.getByTestId("foo-0-remove"));
  expect(screen.getAllByText("too short")).toHaveLength(3);
  expect(screen.getByTestId("array-error")).toHaveTextContent("too short");
});

it("should support custom validation behavior", async () => {
  const submit = vi.fn();

  const FA = ({ scope }: { scope: FormScope<string[]> }) => {
    const array = useFieldArray(scope, {
      validationBehavior: {
        initial: "onChange",
        whenSubmitted: "onChange",
      },
    });

    return (
      <>
        {array.map((key, item, index) => {
          return (
            <div key={key}>
              <input
                data-testid={`foo-${index}`}
                {...item.field().getInputProps()}
              />
              <button
                type="button"
                onClick={() => {
                  array.remove(index);
                }}
                data-testid={`foo-${index}-remove`}
              />
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => array.push("new")}
          data-testid="add"
        >
          Add
        </button>
        <pre data-testid={`foo-error`}>{array.error()}</pre>
      </>
    );
  };

  const TestComp = () => {
    const form = useForm({
      defaultValues: {
        foo: ["foo", "bar"],
      },
      validator: createValidator({
        validate: () => {
          return Promise.resolve({
            data: undefined,
            error: {
              foo: "not enough items",
            },
          });
        },
      }),
      handleSubmit: submit,
    });

    return (
      <form {...form.getFormProps()}>
        <FA scope={form.scope("foo")} />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);

  expect(screen.getByTestId("foo-error")).toBeEmptyDOMElement();
  await userEvent.click(screen.getByTestId("add"));
  // await userEvent.click(screen.getByTestId("submit"));
  expect(screen.getByTestId("foo-error")).toHaveTextContent("not enough items");
});

it("should retain state when doing operations", async () => {
  const Counter = (props: ComponentProps<"button">) => {
    const [count, setCount] = useState(0);
    return (
      <div>
        <button
          {...props}
          type="button"
          onClick={() => {
            setCount(count + 1);
          }}
        >
          {count}
        </button>
      </div>
    );
  };

  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <form {...form.getFormProps()}>
        {form.array("foo").map((key, _, index) => {
          return (
            <div key={key}>
              <div>{key}</div>
              <Counter data-testid={`foo-${index}-count`} />
            </div>
          );
        })}
        <button
          type="button"
          data-testid="swap"
          onClick={() => form.array("foo").swap(0, 1)}
        />
      </form>
    );
  };

  render(<Comp />);
  expect(screen.getByTestId("foo-0-count")).toHaveTextContent("0");
  expect(screen.getByTestId("foo-1-count")).toHaveTextContent("0");

  await userEvent.click(screen.getByTestId("foo-0-count"));
  await userEvent.click(screen.getByTestId("foo-0-count"));
  await userEvent.click(screen.getByTestId("foo-1-count"));

  expect(screen.getByTestId("foo-0-count")).toHaveTextContent("2");
  expect(screen.getByTestId("foo-1-count")).toHaveTextContent("1");

  await userEvent.click(screen.getByTestId("swap"));

  expect(screen.getByTestId("foo-0-count")).toHaveTextContent("1");
  expect(screen.getByTestId("foo-1-count")).toHaveTextContent("2");
});

it("should combo well with `useField`", async () => {
  const MyInput = ({ scope, id }: { scope: FormScope<string>; id: string }) => {
    const field = useField(scope);
    return (
      <input {...field.getInputProps({ type: "text" })} data-testid={id} />
    );
  };

  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: [{ name: "" }, { name: "" }],
      },
      validator: successValidator,
    });

    return (
      <form {...form.getFormProps()}>
        {form.array("foo").map((key, item, index) => {
          expect(item.name()).toEqual(`foo[${index}]`);
          return (
            <MyInput
              scope={item.scope("name")}
              key={key}
              id={`name-${index}`}
            />
          );
        })}
      </form>
    );
  };

  render(<Comp />);

  await userEvent.type(screen.getByTestId("name-0"), "foo");
  expect(screen.getByTestId("name-0")).toHaveValue("foo");

  await userEvent.type(screen.getByTestId("name-1"), "bar");
  expect(screen.getByTestId("name-1")).toHaveValue("bar");
});

// TODO: Maybe userland focus overrides, but we should handle it automatically by default
it("should be possible to await updates from field arrays, move focus in userland to the new inputs", async () => {
  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: [{ name: "" }, { name: "" }],
      },
      validator: successValidator,
    });

    return (
      <form {...form.getFormProps()}>
        {form.array("foo").map((key, item, index) => {
          return (
            <div key={key}>
              <input
                data-testid={`foo-${index}-name`}
                {...item.field("name").getInputProps()}
              />
            </div>
          );
        })}
        <button
          data-testid="add"
          type="button"
          onClick={async () => {
            const numItems = form.array("foo").length();
            await form.array("foo").push({ name: "" });
            form.focus(`foo[${numItems}].name`);
          }}
        ></button>
      </form>
    );
  };

  render(<Comp />);

  await userEvent.click(screen.getByTestId("add"));
  expect(screen.getByTestId("foo-2-name")).toHaveFocus();
});

// LAUNCH:
it.todo("should focus new inputs automatically");

it("should be possible to set a focus target for array-level errors", async () => {
  const Comp = () => {
    const form = useForm({
      defaultValues: {
        foo: [{ name: "" }],
        bar: "",
      },
      validator: createValidator({
        validate: (data) => {
          const errors: FieldErrors = {};
          if (data.bar === "") errors.bar = "bar required";
          if (data.foo[0].name === "") errors["foo[0].name"] = "name required";
          if (data.foo[0].name === "bob") {
            errors.foo = "no bob's allowed";
            errors["foo[0].name"] = "no bob's allowed";
          }
          if (Object.keys(errors).length > 0)
            return Promise.resolve({ error: errors, data: undefined });
          return Promise.resolve({ data, error: undefined });
        },
      }),
    });

    return (
      <form {...form.getFormProps()}>
        <input {...form.getInputProps("bar")} data-testid="bar" />
        {form.error("foo") && (
          <div
            data-testid="foo-error"
            tabIndex={0}
            ref={form.array("foo").errorFocusElement}
          >
            {form.error("foo")}
          </div>
        )}
        {form.array("foo").map((key, item, index) => {
          return (
            <div key={key}>
              <input
                data-testid={`foo-${index}-name`}
                {...item.field("name").getInputProps()}
              />
              <div data-testid={`foo-${index}-error`}>{item.error()}</div>
            </div>
          );
        })}
        <button data-testid="submit" type="submit" />
      </form>
    );
  };

  render(<Comp />);

  await userEvent.click(screen.getByTestId("submit"));
  expect(screen.getByTestId("bar")).toHaveFocus();
  await userEvent.type(screen.getByTestId("bar"), "hello");

  await userEvent.click(screen.getByTestId("submit"));
  expect(screen.getByTestId("foo-0-name")).toHaveFocus();
  await userEvent.type(screen.getByTestId("foo-0-name"), "bob");

  await userEvent.click(screen.getByTestId("submit"));
  expect(screen.getByTestId("foo-error")).toHaveFocus();
});
