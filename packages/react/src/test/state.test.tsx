import { act, renderHook, waitFor } from "@testing-library/react";
import { useRvf } from "../react";
import { successValidator } from "./util/successValidator";
import { useEffect, useRef } from "react";

it("should return submit state", async () => {
  let prom: PromiseWithResolvers<any> | null = null;
  const submission = () => {
    prom = Promise.withResolvers<any>();
    return prom.promise;
  };

  const { result } = renderHook(() => {
    const form = useRvf({
      defaultValues: {
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
      submit: form.submit,
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
      defaultValues: {
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
      submit: form.submit,
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

it("should be possible to access the default values in the form or a field", async () => {
  const { result } = renderHook(() => {
    const form = useRvf({
      defaultValues: {
        foo: "bar",
      },
      validator: successValidator,
      onSubmit: vi.fn(),
    });
    return {
      defaultValues: {
        form: form.defaultValue(),
        foo: form.defaultValue("foo"),
      },
      foo: form.field("foo"),
      reset: form.resetForm,
    };
  });

  expect(result.current.defaultValues).toEqual({
    form: { foo: "bar" },
    foo: "bar",
  });

  act(() => result.current.foo.onChange("test"));
  await waitFor(() => {
    expect(result.current.defaultValues).toEqual({
      form: { foo: "bar" },
      foo: "bar",
    });
  });

  act(() => result.current.reset({ foo: "bob ross" }));
  await waitFor(() => {
    expect(result.current.defaultValues).toEqual({
      form: { foo: "bob ross" },
      foo: "bob ross",
    });
  });

  act(() => result.current.foo.onChange("test"));
  await waitFor(() => {
    expect(result.current.defaultValues).toEqual({
      form: { foo: "bob ross" },
      foo: "bob ross",
    });
  });
});

it("should be possible to set the dirty state of a field", async () => {
  let prom: PromiseWithResolvers<any> | null = null;
  const validator = () => {
    prom = Promise.withResolvers<any>();
    return prom.promise;
  };

  const { result } = renderHook(() => {
    const form = useRvf({
      defaultValues: {
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
        error: form.error("foo"),
      },
      setDirty: form.setDirty,
      setTouched: form.setTouched,
      setError: form.setError,
    };
  });

  expect(result.current.state).toEqual({
    dirty: false,
    touched: false,
    valid: true,
    error: undefined,
  });

  act(() => {
    result.current.setDirty("foo", true);
  });
  await waitFor(() => {
    expect(result.current.state).toEqual({
      dirty: true,
      touched: false,
      valid: true,
      error: undefined,
    });
  });

  act(() => {
    result.current.setTouched("foo", true);
  });
  await waitFor(() => {
    expect(result.current.state).toEqual({
      dirty: true,
      touched: true,
      valid: true,
      error: undefined,
    });
  });

  act(() => {
    result.current.setError("foo", "test");
  });
  await waitFor(() => {
    expect(result.current.state).toEqual({
      dirty: true,
      touched: true,
      valid: false,
      error: "test",
    });
  });

  act(() => {
    result.current.setError("foo", null);
  });
  await waitFor(() => {
    expect(result.current.state).toEqual({
      dirty: true,
      touched: true,
      valid: true,
      error: undefined,
    });
  });
});

it("should be possible to set the dirty/touched/error state of the entire form scope", async () => {
  const { result } = renderHook(() => {
    const form = useRvf({
      defaultValues: {
        foo: "bar",
      },
      validator: successValidator,
      onSubmit: vi.fn(),
    });

    return {
      state: {
        dirty: form.dirty(),
        touched: form.touched(),
        error: form.error(),
      },
      setDirty: form.setDirty,
      setTouched: form.setTouched,
      setError: form.setError,
    };
  });

  expect(result.current.state).toEqual({
    dirty: false,
    touched: false,
    error: undefined,
  });

  act(() => {
    result.current.setDirty(true);
  });

  expect(result.current.state).toEqual({
    dirty: true,
    touched: false,
    error: undefined,
  });

  act(() => {
    result.current.setTouched(true);
  });
  await waitFor(() => {
    expect(result.current.state).toEqual({
      dirty: true,
      touched: true,
      error: undefined,
    });
  });

  act(() => {
    result.current.setError("test");
  });
  await waitFor(() => {
    expect(result.current.state).toEqual({
      dirty: true,
      touched: true,
      error: "test",
    });
  });
});

it("should always give most up-to-date state when accessed outside of render", async () => {
  const { result } = renderHook(() => {
    const form = useRvf({
      defaultValues: {
        foo: "bar",
      },
      validator: successValidator,
      onSubmit: vi.fn(),
    });

    const initialRef = useRef(form.dirty("foo"));
    const changedRef = useRef(form.dirty("foo"));
    useEffect(() => {
      form.setDirty("foo", true);
      changedRef.current = form.dirty("foo");
    }, [form]);

    return {
      touched: form.touched,
      setTouched: form.setTouched,
      dirty: {
        initial: initialRef,
        changed: changedRef,
      },
    };
  });

  const res = result.current;
  expect(res.dirty.initial.current).toBe(false);
  expect(res.dirty.changed.current).toBe(true);
});

it("should be possible to set the value for the entire form scope or a field", async () => {
  const { result } = renderHook(() => {
    const form = useRvf({
      defaultValues: {
        foo: "bar",
      },
      validator: successValidator,
      onSubmit: vi.fn(),
    });

    const scope = useRvf(form.scope("foo"));
    return {
      value: form.value(),
      setValue: form.setValue,
      scopedSet: scope.setValue,
    };
  });

  expect(result.current.value).toEqual({
    foo: "bar",
  });

  act(() => {
    result.current.setValue("foo", "bob");
  });
  expect(result.current.value).toEqual({
    foo: "bob",
  });

  act(() => {
    result.current.setValue({
      foo: "baz",
    });
  });
  expect(result.current.value).toEqual({
    foo: "baz",
  });

  act(() => {
    result.current.scopedSet("quux");
  });
  expect(result.current.value).toEqual({
    foo: "quux",
  });
});
