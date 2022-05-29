import { withZod } from "@remix-validated-form/with-zod";
import { nanoid } from "nanoid";
import { ValidatedForm, useFieldArray } from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { InputWithTouched } from "~/components/InputWithTouched";

const validator = withZod(
  z.object({
    todos: z.array(
      z.object({
        id: z.string(),
        title: zfd.text(
          z.string({
            required_error: "Title is required",
          })
        ),
        note: zfd.text().optional(),
      })
    ),
  })
);

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
  const [items, { swap, insert, pop, unshift, replace, push, move, remove }] =
    useFieldArray("todos", "form");
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      defaultValues={defaultValues}
      id="form"
    >
      {items.map((item, index) => (
        <div key={item.id} data-testid={`todo-${index}`}>
          <input
            type="hidden"
            name={`todos[${index}].id`}
            value={item.id}
            data-testid="todo-id"
          />
          <InputWithTouched name={`todos[${index}].title`} label="Title" />
          <InputWithTouched name={`todos[${index}].notes`} label="Notes" />
          <button
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
    </ValidatedForm>
  );
}
