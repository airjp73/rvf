import { useRef, useState } from "react";
import { useNativeValidity } from "../useNativeValidity";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("should setCustomValidity on the input when the error changes", async () => {
  const Comp = () => {
    const ref = useRef<HTMLInputElement>(null);
    const [error, setError] = useState("test");
    useNativeValidity(ref, error);
    return (
      <div>
        <input ref={ref} data-testid="input" />
        <button
          type="button"
          onClick={() => setError("")}
          data-testid="clear"
        />
        <button
          type="button"
          onClick={() => setError("jimbo")}
          data-testid="change"
        />
      </div>
    );
  };

  render(<Comp />);

  expect(screen.getByTestId("input")).toBeInvalid();

  await userEvent.click(screen.getByTestId("clear"));
  expect(screen.getByTestId("input")).toBeValid();

  await userEvent.click(screen.getByTestId("change"));
  expect(screen.getByTestId("input")).toBeInvalid();
});
