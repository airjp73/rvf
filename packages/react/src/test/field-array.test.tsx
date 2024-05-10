import { render, screen } from "@testing-library/react";
import { useRvf } from "../useRvf";
import userEvent from "@testing-library/user-event";
import { Fragment } from "react/jsx-runtime";
import { RenderCounter } from "./util/RenderCounter";
import { describe, expect, it, vi } from "vitest";
import { successValidator } from "./util/successValidator";
import { controlInput } from "./util/controlInput";

it("should only accept array values", () => {
  const Comp = () => {
    const form = useRvf({
      defaultValues: {
        foo: ["bar"],
        bar: "bar",
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    form.array("foo");

    const arrForm = useRvf(form.scope("foo"));
    arrForm.array();

    // @ts-expect-error
    form.array();

    // @ts-expect-error
    form.array("bar");
  };
});

describe("controlled items", () => {
  it("should render every item in the array", async () => {
    const Comp = () => {
      const form = useRvf({
        defaultValues: {
          foo: [{ name: "bar" }, { name: "baz" }],
        },
        validator: successValidator,
        handleSubmit: vi.fn(),
      });

      return (
        <div>
          {form.array("foo").map((key, item, index) => {
            return (
              <input
                key={key}
                data-testid={`foo-${index}`}
                {...controlInput(item.field("name"))}
              />
            );
          })}
        </div>
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
      const form = useRvf({
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
                {...controlInput(item.field())}
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
      const form = useRvf({
        defaultValues: {
          foo: [{ name: "bar" }, { name: "baz" }],
        },
        validator: successValidator,
        handleSubmit: vi.fn(),
      });

      return (
        <div>
          {form.array("foo").map((key, item, index) => (
            <input
              key={key}
              data-testid={`foo-${index}`}
              {...item.field("name").getInputProps()}
            />
          ))}
        </div>
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
      const form = useRvf({
        defaultValues: {
          foo: [{ name: "bar" }, { name: "baz" }],
        },
        validator: successValidator,
        handleSubmit: vi.fn(),
      });

      return (
        <div>
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
        </div>
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
      const form = useRvf({
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
    ).toMatchInlineSnapshot(`"2"`);
    expect(screen.getByTestId("foo-0")).toHaveValue("bartest");
    expect(
      screen.getByTestId("foo-0-render-count").textContent,
    ).toMatchInlineSnapshot(`"2"`);
    expect(screen.getByTestId("foo-1")).toHaveValue("baz");
    expect(
      screen.getByTestId("foo-1-render-count").textContent,
    ).toMatchInlineSnapshot(`"2"`);
  });
});

it("should work with a pre-scoped form", async () => {
  const Comp = () => {
    const form = useRvf({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });
    const array = useRvf(form.scope("foo"));

    return (
      <div>
        {array.array().map((key, item, index) => {
          return (
            <input
              key={key}
              data-testid={`foo-${index}`}
              {...controlInput(item.field("name"))}
            />
          );
        })}
      </div>
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
    const form = useRvf({
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
    const form = useRvf({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <div>
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
      </div>
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
    const form = useRvf({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <div>
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
      </div>
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
    const form = useRvf({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <div>
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
      </div>
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
    const form = useRvf({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <div>
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
      </div>
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
    const form = useRvf({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <div>
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
      </div>
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
    const form = useRvf({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }, { name: "quux" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <div>
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
      </div>
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

  await userEvent.click(screen.getByTestId("move"));
  expect(screen.getByTestId("foo-0")).toHaveValue("baz");
  expect(screen.getByTestId("foo-0-touched")).toHaveTextContent("false");
  expect(screen.getByTestId("foo-1")).toHaveValue("bar");
  expect(screen.getByTestId("foo-1-touched")).toHaveTextContent("true");
  expect(screen.getByTestId("foo-2")).toHaveValue("quux");
  expect(screen.getByTestId("foo-2-touched")).toHaveTextContent("false");
});

it("should be able to swap within an array", async () => {
  const Comp = () => {
    const form = useRvf({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }, { name: "quux" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <div>
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
      </div>
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
    const form = useRvf({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }, { name: "quux" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <div>
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
      </div>
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
    const form = useRvf({
      defaultValues: {
        foo: [{ name: "bar" }, { name: "baz" }, { name: "quux" }],
      },
      validator: successValidator,
      handleSubmit: vi.fn(),
    });

    return (
      <div>
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
      </div>
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

it.todo("should validate on submit, then on change after that by default");
it.todo("should support custom validation behavior");
