import { withZod } from "@rvf/zod";
import { nanoid } from "nanoid";
import { FieldArray, ValidatedForm, validationError } from "@rvf/react-router";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Input } from "~/components/Input";
import { SubmitButton } from "~/components/SubmitButton";
import { Route } from "./+types/field-array.no-defaults";

const validator = withZod(
  z.object({
    todos: z.array(
      z.object({
        id: z.string(),
        title: zfd.text(),
        notes: zfd.text().optional(),
      }),
    ),
  }),
);

export const action = async ({ request }: Route.ActionArgs) => {
  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error);
  return { message: "Submitted!", todos: result.data.todos };
};

export default function FrontendValidation({
  actionData: data,
}: Route.ComponentProps) {
  return (
    <ValidatedForm validator={validator} method="post">
      {data && "message" in data && (
        <>
          <h3>{data.message}</h3>
          <ul>
            {data.todos.map((todo: any, index: number) => (
              <li key={index} data-testid="submitted-todo">
                {todo.title}: {todo.notes}
              </li>
            ))}
          </ul>
        </>
      )}
      <FieldArray name="todos">
        {({ map, push, remove }) => (
          <>
            {map((key, item, index) => (
              <div key={key} data-testid={`todo-${index}`}>
                <input
                  type="hidden"
                  name={`todos[${index}].id`}
                  value={item.value("id" as never)}
                  data-testid="todo-id"
                />
                <Input name={`todos[${index}].title`} label="Title" />
                <Input name={`todos[${index}].notes`} label="Notes" />
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
            <button type="button" onClick={() => push({ id: nanoid() })}>
              Add todo
            </button>
          </>
        )}
      </FieldArray>
      <SubmitButton />
    </ValidatedForm>
  );
}
