import { renderHook } from "@testing-library/react";
import { useRvf } from "../react";
import { successValidator } from "./util/successValidator";

// it("should return an isSubmitting state", () => {
//   const form = renderHook(() => {
//     const form = useRvf({
//       initialValues: {
//         foo: "bar",
//       },
//       validator: successValidator,
//       onSubmit: vi.fn(),
//     });
//   });

//   expect(form.isSubmitting).toBe(false);
//   form.handleSubmit();
//   expect(form.isSubmitting).toBe(true);
//   form.handleSubmit();
//   expect(form.isSubmitting).toBe(false);
// });

it.todo("should return an isSubmitting state");
it.todo("should return submit status state");

it.todo("should return formDirty state");
it.todo("should return formTouched state");
it.todo("should return formValid state");
it.todo("should be possible to set the dirty state of a field");
it.todo("should be possible to set the touched state of a field");
it.todo("should be possible to set the error of a field");

it.todo("should be possible to access the default values in the form");
it.todo("should be possible to access the default values of a field");
