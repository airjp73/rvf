import { render } from "@testing-library/react";
import React, { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { requestSubmit } from "./requestSubmit";

describe("requestSubmit polyfill", () => {
  it("should polyfill requestSubmit", () => {
    const submit = vi.fn();
    const ref = createRef<HTMLFormElement>();
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        ref={ref}
      >
        <input name="test" value="testing" />
      </form>
    );
    requestSubmit(ref.current!);
    expect(submit).toHaveBeenCalledTimes(1);
  });
});
