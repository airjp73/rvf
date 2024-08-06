import { render, screen, waitFor } from "@testing-library/react";
import { useForm } from "../useForm";
import { successValidator } from "./util/successValidator";
import userEvent from "@testing-library/user-event";
import { createValidator, Validator } from "@rvf/core";
import { act } from "react";

const withResolvers = () => {
  let resolve;
  let reject;
  const promise = new Promise<void>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return {
    promise,
    resolve: resolve as never as () => void,
    reject: reject as never as () => void,
  };
};

it("should call onSubmitSuccess", async () => {
  const submitSuccess = vi.fn();
  let resolveSuccess: (() => void) | null = null;

  const TestComp = () => {
    const form = useForm({
      submitSource: "dom",
      defaultValues: { foo: 123 },
      validator: successValidator as Validator<{ foo: number }>,

      handleSubmit: async (_) => {
        return {
          bar: "baz",
        };
      },
      onSubmitSuccess: (res) => {
        expectTypeOf(res).toEqualTypeOf<{ bar: string }>();
        submitSuccess(res);
        const { resolve, promise } = withResolvers();
        resolveSuccess = resolve;
        return promise;
      },
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <pre data-testid="loading">{form.formState.submitStatus}</pre>
        <input readOnly data-testid="foo" value="456" name="foo" />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);

  expect(screen.getByTestId("loading")).toHaveTextContent("idle");

  await userEvent.click(screen.getByTestId("submit"));
  await waitFor(() => {
    expect(submitSuccess).toHaveBeenCalledTimes(1);
  });
  expect(screen.getByTestId("loading")).toHaveTextContent("submitting");
  expect(submitSuccess).toHaveBeenCalledWith({ bar: "baz" });

  act(() => resolveSuccess?.());
  await waitFor(() => {
    expect(screen.getByTestId("loading")).toHaveTextContent("success");
  });
});

it("should still call onInvalidSubmit when submitting manually", async () => {
  const invalidSubmit = vi.fn();

  const TestComp = () => {
    const form = useForm({
      submitSource: "state",
      defaultValues: { foo: 123 },
      validator: createValidator({
        validate: () => {
          return Promise.resolve({ data: undefined, error: { foo: "bar" } });
        },
      }),

      handleSubmit: async (_) => {
        return {
          bar: "baz",
        };
      },
      onInvalidSubmit: invalidSubmit,
    });

    return (
      <div>
        <pre data-testid="loading">{form.formState.submitStatus}</pre>
        <input
          data-testid="foo"
          name="foo"
          {...form.field("foo").getInputProps()}
        />
        <button
          type="button"
          data-testid="submit"
          onClick={() => form.submit()}
        />
      </div>
    );
  };

  render(<TestComp />);

  expect(screen.getByTestId("loading")).toHaveTextContent("idle");

  await userEvent.click(screen.getByTestId("submit"));
  await waitFor(() => {
    expect(invalidSubmit).toHaveBeenCalledTimes(1);
  });
  expect(screen.getByTestId("foo")).toHaveFocus();
});

it("should call onSubmitFailure", async () => {
  const submitFailure = vi.fn();
  const error = new Error("test");
  let resolveFailure: (() => void) | null = null;

  const TestComp = () => {
    const form = useForm({
      defaultValues: { foo: 123 },
      validator: successValidator as Validator<{ foo: 123 }>,

      onSubmitFailure: (err) => {
        submitFailure(err);
        const { resolve, promise } = withResolvers();
        resolveFailure = resolve;
        return promise;
      },
      handleSubmit: async () => {
        throw error;
      },
    });

    return (
      <form {...form.getFormProps()} data-testid="form">
        <pre data-testid="loading">{form.formState.submitStatus}</pre>
        <input readOnly data-testid="foo" value="456" name="foo" />
        <button type="submit" data-testid="submit" />
      </form>
    );
  };

  render(<TestComp />);

  expect(screen.getByTestId("loading")).toHaveTextContent("idle");

  await userEvent.click(screen.getByTestId("submit"));
  await waitFor(() => {
    expect(submitFailure).toHaveBeenCalledTimes(1);
  });
  expect(screen.getByTestId("loading")).toHaveTextContent("submitting");
  expect(submitFailure).toHaveBeenCalledWith(error);

  act(() => resolveFailure?.());
  await waitFor(() => {
    expect(screen.getByTestId("loading")).toHaveTextContent("error");
  });
});
