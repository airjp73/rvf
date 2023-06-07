import { withZod } from "@remix-validated-form/with-zod";
import { nanoid } from "nanoid";
import {
  FieldArray,
  useControlField,
  useField,
  ValidatedForm,
} from "remix-validated-form";
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
            })
          ),
          note: zfd.text().optional(),
        })
      )
      .refine((arr) => arr.length > 1, "Must have at least two todos"),
  })
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
      {touched && <span>{name} touched</span>}
      {error && <p data-testid="text-error">{error}</p>}
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
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      defaultValues={defaultValues}
    >
      <FieldArray name="todos">
        {(
          items,
          { push, remove, swap, move, insert, pop, unshift, replace },
          error
        ) => (
          <>
            {items.map(({ defaultValue, key }, index) => (
              <div key={key} data-testid={`todo-${index}`}>
                <input
                  type="hidden"
                  name={`todos[${index}].id`}
                  value={defaultValue.id}
                  data-testid="todo-id"
                />
                <ControlledInput name={`todos[${index}].title`} label="Title" />
                <ControlledInput name={`todos[${index}].notes`} label="Notes" />
                <button
                  type="button"
                  onClick={() => {
                    remove(index);
                  }}
                >
                  Delete todo
                </button>
              </div>
            ))}
            <button type="button" onClick={() => swap(0, 2)}>
              Swap
            </button>
            <button type="button" onClick={() => move(0, 2)}>
              Move
            </button>
            <button type="button" onClick={() => insert(1, { id: nanoid() })}>
              Insert
            </button>
            <button type="button" onClick={() => pop()}>
              Pop
            </button>
            <button type="button" onClick={() => unshift({ id: nanoid() })}>
              Unshift
            </button>
            <button
              type="button"
              onClick={() =>
                replace(1, {
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
                push({
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
            {error && <div>{error}</div>}
          </>
        )}
      </FieldArray>
    </ValidatedForm>
  );
}
