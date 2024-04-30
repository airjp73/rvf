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

it.todo("should return submit status state");

it.todo("should return formDirty state");
it.todo("should return formTouched state");
it.todo("should return formValid state");
it.todo("should be possible to set the dirty state of a field");
it.todo("should be possible to set the touched state of a field");
it.todo("should be possible to set the error of a field");

it.todo("should be possible to access the default values in the form");
it.todo("should be possible to access the default values of a field");
