import { act, renderHook, waitFor } from "@testing-library/react";
import { useRvf } from "../react";
import { successValidator } from "./util/successValidator";

it("should return submit state", async () => {
  let prom: PromiseWithResolvers<any> | null = null;
  const submission = () => {
    prom = Promise.withResolvers<any>();
    return prom.promise;
  };

  const { result } = renderHook(() => {
    const form = useRvf({
      initialValues: {
        foo: "bar",
      },
      validator: successValidator,
      onSubmit: submission,
    });
    return {
      state: {
        isSubmitting: form.formState.isSubmitting,
        submitStatus: form.formState.submitStatus,
        hasBeenSubmitted: form.formState.hasBeenSubmitted,
      },
      submit: form.handleSubmit,
    };
  });

  expect(result.current.state).toEqual({
    isSubmitting: false,
    submitStatus: "idle",
    hasBeenSubmitted: false,
  });

  act(() => result.current.submit());
  await waitFor(() => {
    expect(result.current.state).toEqual({
      isSubmitting: true,
      submitStatus: "submitting",
      hasBeenSubmitted: true,
    });
  });

  act(() => prom?.resolve({}));
  await waitFor(() => {
    expect(result.current.state).toEqual({
      isSubmitting: false,
      submitStatus: "success",
      hasBeenSubmitted: true,
    });
  });

  act(() => result.current.submit());
  await waitFor(() => {
    expect(result.current.state).toEqual({
      isSubmitting: true,
      submitStatus: "submitting",
      hasBeenSubmitted: true,
    });
  });

  act(() => prom?.reject({}));
  await waitFor(() => {
    expect(result.current.state).toEqual({
      isSubmitting: false,
      submitStatus: "error",
      hasBeenSubmitted: true,
    });
  });
});

it("should return form dirty/touched/valid state", async () => {
  let prom: PromiseWithResolvers<any> | null = null;
  const validator = () => {
    prom = Promise.withResolvers<any>();
    return prom.promise;
  };

  const { result } = renderHook(() => {
    const form = useRvf({
      initialValues: {
        foo: "bar",
      },
      validator,
      onSubmit: vi.fn(),
    });
    return {
      state: {
        dirty: form.formState.isDirty,
        touched: form.formState.isTouched,
        valid: form.formState.isValid,
      },
      foo: form.field("foo"),
      submit: form.handleSubmit,
    };
  });

  expect(result.current.state).toEqual({
    dirty: false,
    touched: false,
    valid: true,
  });

  act(() => {
    result.current.submit();
    prom?.resolve({ error: { foo: "bar" } });
  });
  await waitFor(() => {
    expect(result.current.state).toEqual({
      dirty: false,
      touched: false,
      valid: false,
    });
  });

  act(() => {
    result.current.foo.onChange("test");
    prom?.resolve({ data: { foo: "test" } });
  });
  await waitFor(() => {
    expect(result.current.state).toEqual({
      dirty: true,
      touched: false,
      valid: true,
    });
  });

  act(() => {
    result.current.foo.onBlur();
    prom?.resolve({ data: { foo: "test" } });
  });
  await waitFor(() => {
    expect(result.current.state).toEqual({
      dirty: true,
      touched: true,
      valid: true,
    });
  });
});

it.todo("should be possible to set the dirty state of a field");
it.todo("should be possible to set the touched state of a field");
it.todo("should be possible to set the error of a field");

it.todo("should be possible to access the default values in the form");
it.todo("should be possible to access the default values of a field");
