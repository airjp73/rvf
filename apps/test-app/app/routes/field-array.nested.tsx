import { withZod } from "@rvf/zod";
import { nanoid } from "nanoid";
import { RvfProvider, ValidatedForm, useFieldArray, useRvf } from "@rvf/remix";
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
            }),
          ),
          notes: z
            .array(z.object({ text: zfd.text() }))
            .optional()
            .refine(
              (arr) => (arr ?? []).length >= 1,
              "Must have at least one note",
            ),
        }),
      )
      .refine((arr) => arr.length > 1, "Must have at least two todos"),
  }),
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
  const array = useFieldArray(name);

  return (
    <div>
      <ul>
        {array.map((key, item, index) => (
          <li key={key} data-testid="note">
            <InputWithTouched
              name={`${name}[${index}].text`}
              label={`Note ${index}`}
            />
            <button type="button" onClick={() => array.remove(index)}>
              Delete note {index}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => array.push({ text: "New note" })}>
        Add note
      </button>
      {array.error() && <div>{array.error()}</div>}
    </div>
  );
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
    <RvfProvider scope={form.scope()}>
      <form {...form.getFormProps()}>
        {array.map((key, item, index) => (
          <div key={key} data-testid={`todo-${index}`}>
            <input
              type="hidden"
              name={`todos[${index}].id`}
              value={item.value("id")}
              data-testid="todo-id"
            />
            <InputWithTouched name={`todos[${index}].title`} label="Title" />
            <Notes name={`todos[${index}].notes`} />
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
          onClick={() =>
            array.insert(1, { id: nanoid(), title: "", notes: [] })
          }
        >
          Insert
        </button>
        <button type="button" onClick={() => array.pop()}>
          Pop
        </button>
        <button
          type="button"
          onClick={() => array.unshift({ id: nanoid(), title: "", notes: [] })}
        >
          Unshift
        </button>
        <button
          type="button"
          onClick={() =>
            array.replace(1, {
              id: nanoid(),
              title: "New title",
              notes: [{ text: "New note" }],
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
              notes: [{ text: "New note" }],
            })
          }
        >
          Push
        </button>
        <button type="reset">Reset</button>
        <button type="submit">Submit</button>
        {array.error() && <div>{array.error()}</div>}
      </form>
    </RvfProvider>
  );
}
