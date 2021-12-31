import { Button } from "@chakra-ui/react";
import { PlusIcon, XIcon } from "@heroicons/react/outline";
import { withZod } from "@remix-validated-form/with-zod";
import { useState } from "react";
import {
  json,
  LoaderFunction,
  useActionData,
  useLoaderData,
  ActionFunction,
} from "remix";
import {
  ValidatedForm,
  validationError,
  ValidatorData,
} from "remix-validated-form";
import { z } from "zod";
import { Alert } from "~/components/Alert";
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
  const result = validator.validate(
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
          id: "0",
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
  const [todoIds, setTodoIds] = useState(
    defaultValues.todos.map((todo) => todo.id)
  );

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      defaultValues={defaultValues}
    >
      <FormInput name="name" label="Your name" />
      {todoIds.map((id, index) => (
        <div key={id} className="todo-item">
          <input
            type="hidden"
            name={`todos[${index}].id`}
            value={id}
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
              setTodoIds((prev) =>
                prev.filter((todoId) => todoId !== id)
              );
            }}
          >
            <XIcon /> Delete todo
          </Button>
        </div>
      ))}
      <Button
        onClick={() =>
          setTodoIds((prev) => [
            ...prev,
            String(todoIds.length),
          ])
        }
      >
        <PlusIcon /> Add todo
      </Button>
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
