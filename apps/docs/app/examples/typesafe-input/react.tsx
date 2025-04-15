import { useForm } from "@rvf/react";
import { showToastMessage } from "~/lib/utils";
import { MyInput } from "~/fields/MyInput";
import { z } from "zod";

export const InputTypes = () => {
  const form = useForm({
    schema: z.object({
      text: z.string(),
      number: z.number(),
      checkbox: z.boolean(),
      radio: z.string(),
      file: z.instanceof(File),
    }),
    defaultValues: {
      text: "Hello",
      number: 123,
      checkbox: true,
      radio: "value1",
      file: null as File | null,
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
