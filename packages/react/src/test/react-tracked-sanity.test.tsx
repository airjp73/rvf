import { render, screen } from "@testing-library/react";
import { create } from "zustand";
import { createTrackedSelector } from "react-tracked";
import userEvent from "@testing-library/user-event";
import { immer } from "zustand/middleware/immer";
import { getPath } from "set-get";

const store = create<{
  foo: string;
  bar: { baz: string };
  setFoo: (foo: string) => void;
  setBaz: (val: string) => void;
}>()(
  immer((set) => ({
    foo: "bar",
    bar: { baz: "quux" },
    setFoo: (foo) =>
      set((draft) => {
        draft.foo = foo;
      }),
    setBaz: (baz) =>
      set((draft) => {
        draft.bar.baz = baz;
      }),
  })),
);
const useTracked = createTrackedSelector(store);

const TestComponent = () => {
  const tracked = useTracked();

  return (
    <div>
      <button
        data-testid="set-foo"
        type="button"
        onClick={() => tracked.setFoo("baz")}
      >
        Set foo
      </button>
      <pre data-testid="foo">{tracked.foo}</pre>

      <button
        data-testid="set-baz"
        type="button"
        onClick={() => tracked.setBaz("baz")}
      >
        Set foo
      </button>
      <pre data-testid="baz">{getPath(tracked, "bar.baz") as string}</pre>
    </div>
  );
};

it("sanity check", async () => {
  render(<TestComponent />);

  expect(screen.getByTestId("foo")).toHaveTextContent("bar");
  await userEvent.click(screen.getByTestId("set-foo"));
  expect(screen.getByTestId("foo")).toHaveTextContent("baz");

  expect(screen.getByTestId("baz")).toHaveTextContent("quux");
  await userEvent.click(screen.getByTestId("set-baz"));
  expect(screen.getByTestId("baz")).toHaveTextContent("baz");
});
