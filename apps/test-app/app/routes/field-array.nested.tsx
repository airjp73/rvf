import { withZod } from "@remix-validated-form/with-zod";
import { nanoid } from "nanoid";
import { ValidatedForm, useFieldArray } from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { InputWithTouched } from "~/components/InputWithTouched";

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
          notes: z
            .array(z.object({ text: zfd.text() }))
            .optional()
            .refine(
              (arr) => (arr ?? []).length >= 1,
              "Must have at least one note"
            ),
        })
      )
      .refine((arr) => arr.length > 1, "Must have at least two todos"),
  })
);

const defaultValues = {
  todos: [
    {
      id: nanoid(),
      title: "Default 1",
      notes: [{ text: "Default note 1" }, { text: "Default note 2" }],
    },
    {
      id: nanoid(),
      title: "Default 2",
      notes: [{ text: "Default note 3" }],
    },
    {
      id: nanoid(),
      title: "Default 3",
      notes: [],
    },
  ],
};

const Notes = ({ name }: { name: string }) => {
  const [items, arr, error] = useFieldArray(name);

  return (
    <div>
      <ul>
        {items.map(({ defaultValue, key }, index) => (
          <li key={key} data-testid="note">
            <InputWithTouched
              name={`${name}[${index}].text`}
              label={`Note ${index}`}
            />
            <button type="button" onClick={() => arr.remove(index)}>
              Delete note {index}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => arr.push({ text: "New note" })}>
        Add note
      </button>
      {error && <div>{error}</div>}
    </div>
  );
};

export default function FrontendValidation() {
  const [
    items,
    { swap, insert, pop, unshift, replace, push, move, remove },
    error,
  ] = useFieldArray("todos", { formId: "form" });
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      defaultValues={defaultValues}
      id="form"
    >
      {items.map(({ defaultValue, key }, index) => (
        <div key={key} data-testid={`todo-${index}`}>
          <input
            type="hidden"
            name={`todos[${index}].id`}
            value={defaultValue.id}
            data-testid="todo-id"
          />
          <InputWithTouched name={`todos[${index}].title`} label="Title" />
          <Notes name={`todos[${index}].notes`} />
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
    </ValidatedForm>
  );
}
