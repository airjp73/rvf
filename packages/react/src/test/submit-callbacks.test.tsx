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

describe("onBeforeSubmit", () => {
  it("should only validate once when onBeforeSubmit performs validations", async () => {
    const callback = vi.fn();
    const submit = vi.fn();

    const TestComp = () => {
      const form = useForm({
        defaultValues: { foo: 123 },
        validator: successValidator as Validator<{ foo: 123 }>,
        onBeforeSubmit: async (api) => {
          callback(api.unvalidatedData, await api.getValidatedData());
        },
        handleSubmit: async (data) => submit(data),
      });

      return (
        <form {...form.getFormProps()} data-testid="form">
          <input data-testid="foo" {...form.getInputProps("foo")} />
          <button type="submit" data-testid="submit" />
        </form>
      );
    };

    render(<TestComp />);
    await userEvent.click(screen.getByTestId("submit"));

    expect(callback).toBeCalledWith({ foo: "123" }, { foo: "123" });
    expect(successValidator.validate).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it("should cancel submit", async () => {
    const callback = vi.fn();
    const submit = vi.fn();
    const failure = vi.fn();

    const TestComp = () => {
      const form = useForm({
        defaultValues: { foo: 123 },
        validator: successValidator as Validator<{ foo: 123 }>,
        onBeforeSubmit: async (api) => {
          callback();
          api.cancelSubmit();
          callback();
        },
        onSubmitFailure: failure,
        handleSubmit: async (data) => submit(data),
      });

      return (
        <form {...form.getFormProps()} data-testid="form">
          <input data-testid="foo" {...form.getInputProps("foo")} />
          <button type="submit" data-testid="submit" />
        </form>
      );
    };

    render(<TestComp />);
    await userEvent.click(screen.getByTestId("submit"));

    expect(callback).toBeCalledTimes(1);
    expect(successValidator.validate).not.toBeCalled();
    expect(submit).not.toBeCalled();
    expect(failure).not.toBeCalled();
  });

  it("should complete submit", async () => {
    const callback = vi.fn();
    const submit = vi.fn();
    const success = vi.fn();

    const TestComp = () => {
      const form = useForm({
        defaultValues: { foo: 123 },
        validator: successValidator as Validator<{ foo: 123 }>,
        onBeforeSubmit: async (api) => {
          callback();
          api.completeSubmit();
          callback();
        },
        onSubmitSuccess: success,
        handleSubmit: async (data) => submit(data),
      });

      return (
        <form {...form.getFormProps()} data-testid="form">
          <input data-testid="foo" {...form.getInputProps("foo")} />
          <button type="submit" data-testid="submit" />
        </form>
      );
    };

    render(<TestComp />);
    await userEvent.click(screen.getByTestId("submit"));

    expect(callback).toBeCalledTimes(1);
    expect(successValidator.validate).not.toBeCalled();
    expect(submit).not.toBeCalled();
    expect(success).not.toBeCalled();
  });

  it("should provide submitter options", async () => {
    const callback = vi.fn();
    const submit = vi.fn();

    const TestComp = () => {
      const form = useForm({
        defaultValues: { foo: 123 },
        validator: successValidator as Validator<{ foo: 123 }>,
        onBeforeSubmit: (api) => {
          callback(api.submitterOptions.formMethod);
        },
        handleSubmit: async (data) => submit(data),
      });

      return (
        <form {...form.getFormProps()} data-testid="form">
          <input data-testid="foo" {...form.getInputProps("foo")} />
          <button
            type="button"
            data-testid="submit"
            onClick={() => {
              // JSDOM doesn't handle submitters, so we'll do this manually
              form.submit({
                formMethod: "post",
              });
            }}
          />
        </form>
      );
    };

    render(<TestComp />);
    await userEvent.click(screen.getByTestId("submit"));

    expect(callback).toBeCalledWith("post");
    expect(successValidator.validate).toBeCalled();
    expect(submit).toBeCalled();
  });

  it("should cancel submit if form is invalid", async () => {
    const callback = vi.fn();
    const submit = vi.fn();

    const TestComp = () => {
      const form = useForm({
        defaultValues: { foo: 123 },
        validator: createValidator({
          validate: () => {
            return Promise.resolve({
              error: { foo: "invalid" },
              data: undefined,
            });
          },
        }),
        onBeforeSubmit: async (api) => {
          callback();
          await api.getValidatedData();
          callback();
        },
        handleSubmit: async (data) => submit(data),
      });

      return (
        <form {...form.getFormProps()} data-testid="form">
          <input data-testid="foo" {...form.getInputProps("foo")} />
          <pre data-testid="foo-error">{form.error("foo")}</pre>
          <button type="submit" data-testid="submit" />
        </form>
      );
    };

    render(<TestComp />);
    await userEvent.click(screen.getByTestId("submit"));

    expect(callback).toBeCalledTimes(1);
    expect(submit).not.toBeCalled();
    expect(screen.getByTestId("foo-error")).toHaveTextContent("invalid");
  });

  it("should return form data in dom mode", async () => {
    const callback = vi.fn();
    const submit = vi.fn();

    const TestComp = () => {
      const form = useForm({
        defaultValues: { foo: 123 },
        validator: successValidator as Validator<{ foo: 123 }>,
        onBeforeSubmit: async (api) => {
          callback(api.getFormData());
        },
        handleSubmit: async (data) => submit(data),
      });

      return (
        <form {...form.getFormProps()} data-testid="form">
          <input data-testid="foo" {...form.getInputProps("foo")} />
          <button type="submit" data-testid="submit" />
        </form>
      );
    };

    render(<TestComp />);
    await userEvent.click(screen.getByTestId("submit"));

    expect(callback).toBeCalledWith(expect.any(FormData));
    expect(submit).toBeCalled();
  });

  it("should not return form data in state mode", async () => {
    const callback = vi.fn();
    const submit = vi.fn();
    const error = vi.fn();

    const TestComp = () => {
      const form = useForm({
        submitSource: "state",
        defaultValues: { foo: 123 },
        validator: successValidator as Validator<{ foo: 123 }>,
        onBeforeSubmit: async (api) => {
          callback(api.getFormData());
        },
        onSubmitFailure: error,
        handleSubmit: async (data) => submit(data),
      });

      return (
        <form {...form.getFormProps()} data-testid="form">
          <input data-testid="foo" {...form.getInputProps("foo")} />
          <button type="submit" data-testid="submit" />
        </form>
      );
    };

    render(<TestComp />);
    await userEvent.click(screen.getByTestId("submit"));

    expect(callback).not.toBeCalled();
    expect(submit).not.toBeCalled();
    expect(error).toBeCalled();
  });
});
