import { PlusIcon, XIcon } from "@heroicons/react/outline";
import { withZod } from "@remix-validated-form/with-zod";
import { nanoid } from "nanoid";
import {
  json,
  LoaderFunction,
  useActionData,
  useLoaderData,
  ActionFunction,
} from "remix";
import {
  FieldArray,
  ValidatedForm,
  validationError,
  ValidatorData,
} from "remix-validated-form";
import { z } from "zod";
import { Alert } from "~/components/Alert";
import { Button } from "~/components/Button";
import { FormInput } from "~/components/FormInput";
import { SubmitButton } from "~/components/SubmitButton";

export const validator = withZod(
  z.object({
    name: z.string().nonempty("First name is required"),
    todos: z.array(
      z.object({
        id: z.string(),
        title: z.string().nonempty("Title is required"),
        notes: z.string().optional(),
      })
    ),
  })
);

type ActionData = {
  submittedName: string;
  todoTitles: string[];
};

export const action: ActionFunction = async ({
  request,
}) => {
  const result = await validator.validate(
    await request.formData()
  );
  if (result.error) return validationError(result.error);
  const { name, todos } = result.data;

  // `todos` here is an array of todo objects
  const todoTitles = todos.map((todo) => todo.title);

  // For the sake of this example, we're just going to return
  // some data and display an alert in the UI
  return json<ActionData>({
    submittedName: name,
    todoTitles,
  });
};

type LoaderData = {
  defaultValues: ValidatorData<typeof validator>;
};

export const loader: LoaderFunction = () => {
  return json<LoaderData>({
    defaultValues: {
      name: "Somebody",
      todos: [
        {
          id: nanoid(),
          title: "Take out the trash",
          notes: "This is an example todo",
        },
      ],
    },
  });
};

export default function Demo() {
  const { defaultValues } = useLoaderData<LoaderData>();
  const data = useActionData<ActionData>();

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      defaultValues={defaultValues}
    >
      <FormInput name="name" label="Your name" />
      <FieldArray name="todos">
        {(items, { push, remove }) => (
          <>
            {items.map((item, index) => (
              <div key={item.id} className="todo-item">
                <input
                  type="hidden"
                  name={`todos[${index}].id`}
                  value={item.id}
                />
                <FormInput
                  name={`todos[${index}].title`}
                  label="Title"
                />
                <FormInput
                  name={`todos[${index}].notes`}
                  label="Notes"
                />
                <Button
                  onClick={() => {
                    remove(index);
                  }}
                  icon={<XIcon />}
                  label="Delete todo"
                />
              </div>
            ))}
            <Button
              onClick={() => push({ id: nanoid() })}
              icon={<PlusIcon />}
              label="Add todo"
            />
          </>
        )}
      </FieldArray>
      {data && (
        <Alert
          variant="info"
          title={`Hello, ${data.submittedName}!`}
          details={`You need to ${data.todoTitles.join(
            ", "
          )}`}
        />
      )}
      <SubmitButton />
    </ValidatedForm>
  );
}
