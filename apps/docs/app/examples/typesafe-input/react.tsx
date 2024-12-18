import { useForm } from "@rvf/react";
import { showToastMessage } from "~/lib/utils";
import { validator } from "./unimportant-details";
import { MyInput } from "~/fields/MyInput";
import { useRef } from "react";

export const InputTypes = () => {
  const form = useForm({
    validator,
    defaultValues: {
      text: "Hello",
      number: 123,
      checkbox: true,
      radio: "value1",
      file: null,
    },
    handleSubmit: () => showToastMessage("Submitted!"),
  });

  return (
    <form {...form.getFormProps()}>
      <MyInput
        label="Text"
        type="text"
        scope={form.scope("text")}
      />
      <MyInput
        label="Number"
        type="number"
        scope={form.scope("number")}
      />
      <MyInput
        label="Check"
        type="checkbox"
        scope={form.scope("checkbox")}
      />
      <MyInput
        label="Radio"
        type="radio"
        scope={form.scope("radio")}
      />
      <MyInput
        label="File"
        type="file"
        scope={form.scope("file")}
      />
    </form>
  );
};
