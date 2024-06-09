import { PlusIcon, XIcon } from "@heroicons/react/outline";
import { json, DataFunctionArgs } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { nanoid } from "nanoid";
import {
  useFieldArray,
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
    name: z
      .string()
      .min(1, { message: "First name is required" }),
    todos: z.array(
      z.object({
        id: z.string(),
        title: z
          .string()
          .min(1, { message: "Title is required" }),
        notes: z.string().optional(),
      }),
    ),
  }),
);

export const action = async ({
  request,
}: DataFunctionArgs) => {
  const result = await validator.validate(
    await request.formData(),
  );
  if (result.error) return validationError(result.error);
  const { name, todos } = result.data;

  // `todos` here is an array of todo objects
  const todoTitles = todos.map((todo) => todo.title);

  // For the sake of this example, we're just going to return
  // some data and display an alert in the UI
  return json({
    submittedName: name,
    todoTitles,
  });
};

type LoaderData = {
  defaultValues: ValidatorData<typeof validator>;
};

export const loader = async (args: DataFunctionArgs) => {
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
  const { defaultValues } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();
  const [items, { push, remove }] = useFieldArray("todos", {
    formId: "usefieldarray-example-form",
  });

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      defaultValues={defaultValues}
      id="usefieldarray-example-form"
    >
      <FormInput name="name" label="Your name" />
      {items.map(({ defaultValue, key }, index) => (
        <div key={key} className="todo-item">
          <input
            type="hidden"
            name={`todos[${index}].id`}
            value={defaultValue.id}
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
      {data && "todoTitles" in data && (
        <Alert
          variant="info"
          title={`Hello, ${data.submittedName}!`}
          details={`You need to ${data.todoTitles.join(
            ", ",
          )}`}
        />
      )}
      <SubmitButton />
    </ValidatedForm>
  );
}
