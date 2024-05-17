import { withZod } from "@rvf/zod";
import { nanoid } from "nanoid";
import { useFieldArray, useControlField, useField, useRvf } from "@rvf/remix";
import { z } from "zod";
import { zfd } from "zod-form-data";

const validator = withZod(
  z.object({
    todos: z
      .array(
        z.object({
          id: z.string(),
          title: zfd.text(
            z.string({
              required_error: "Title is required",
            }),
          ),
          note: zfd.text().optional(),
        }),
      )
      .refine((arr) => arr.length > 1, "Must have at least two todos"),
  }),
);

const ControlledInput = ({ label, name }: { label: string; name: string }) => {
  const { error, getInputProps, touched } = useField(name);
  const [value, setValue] = useControlField<string>(name);

  return (
    <div>
      <label>
        {label}
        <input
          {...getInputProps({
            value,
            onChange: (e) => setValue(e.target.value),
          })}
        />
      </label>
      {touched() && <span>{name} touched</span>}
      {error() && <p data-testid="text-error">{error()}</p>}
    </div>
  );
};

const defaultValues = {
  todos: [
    {
      id: nanoid(),
      title: "Default 1",
      notes: "Default note 1",
    },
    {
      id: nanoid(),
      title: "Default 2",
      notes: "Default note 2",
    },
    {
      id: nanoid(),
      title: "Default 3",
      notes: "Default note 3",
    },
  ],
};

export default function FrontendValidation() {
  const form = useRvf({
    validator,
    method: "post",
    defaultValues,
    formId: "form",
  });

  const array = useFieldArray(form.scope("todos"));

  return (
    <form {...form.getFormProps()}>
      {array.map((key, item, index) => (
        <div key={key} data-testid={`todo-${index}`}>
          <input
            type="hidden"
            name={`todos[${index}].id`}
            value={item.value("id")}
            data-testid="todo-id"
          />
          <ControlledInput name={`todos[${index}].title`} label="Title" />
          <ControlledInput name={`todos[${index}].notes`} label="Notes" />
          <button
            type="button"
            onClick={() => {
              array.remove(index);
            }}
          >
            Delete todo
          </button>
        </div>
      ))}
      <button type="button" onClick={() => array.swap(0, 2)}>
        Swap
      </button>
      <button type="button" onClick={() => array.move(0, 2)}>
        Move
      </button>
      <button
        type="button"
        onClick={() => array.insert(1, { id: nanoid(), title: "", notes: "" })}
      >
        Insert
      </button>
      <button type="button" onClick={() => array.pop()}>
        Pop
      </button>
      <button
        type="button"
        onClick={() => array.unshift({ id: nanoid(), title: "", notes: "" })}
      >
        Unshift
      </button>
      <button
        type="button"
        onClick={() =>
          array.replace(1, {
            id: nanoid(),
            title: "New title",
            notes: "New note",
          })
        }
      >
        Replace
      </button>
      <button
        type="button"
        onClick={() =>
          array.push({
            id: nanoid(),
            title: "New title",
            notes: "New note",
          })
        }
      >
        Push
      </button>
      <button type="reset">Reset</button>
      <button type="submit">Submit</button>
      {array.error() && <div>{array.error()}</div>}
    </form>
  );
}
