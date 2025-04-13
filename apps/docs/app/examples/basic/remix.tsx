import {
  isValidationErrorResponse,
  parseFormData,
  useForm,
  validationError,
} from "@rvf/react-router";
import { z } from "zod";
import { MyInput } from "~/fields/MyInput";
import { Button } from "~/ui/button";
import { createProject } from "./api";
import { ErrorMessage } from "~/fields/ErrorMessage";
import { showToastMessage } from "~/lib/utils";
import { EmptyState } from "~/ui/empty-state";
import {
  ActionFunctionArgs,
  data as dataResponse,
  useActionData,
} from "react-router";

const schema = z.object({
  projectName: z
    .string()
    .min(1, "Projects need a name.")
    .max(50, "Must be 50 characters or less."),
  tasks: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, "Tasks need a title.")
          .max(50, "Must be 50 characters or less."),
        daysToComplete: z.coerce.number({
          required_error: "This is required",
        }),
      }),
    )
    .min(1, "Needs at least one task.")
    .default([]),
});

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const data = await parseFormData(request, schema);
  if (data.error) return validationError(data.error);

  const { projectName, tasks } = data.data;

  await createProject({ name: projectName, tasks });
  return dataResponse({ projectName });
};

export const ReactExample = () => {
  const data = useActionData<typeof action>();
  const form = useForm({
    schema,
    defaultValues: {
      projectName: "",
      tasks: [],
    },
    onSubmitSuccess: () => {
      // We know this isn't an error in the success callback, but Typescript doesn't
      if (isValidationErrorResponse(data)) return;

      // This isn't always the best way to show a toast in remix.
      // https://www.jacobparis.com/content/remix-form-toast
      showToastMessage(
        `Project ${data?.projectName} created!`,
      );
      form.resetForm();
    },
  });

  return (
    <form {...form.getFormProps()}>
      <MyInput
        label="Project name"
        scope={form.scope("projectName")}
      />

      <div>
        <h3>Tasks</h3>
        {form.error("tasks") && (
          <ErrorMessage>{form.error("tasks")}</ErrorMessage>
        )}
        <hr />

        <ul>
          {form.array("tasks").map((key, item, index) => (
            <li key={key}>
              <MyInput
                label="Title"
                scope={item.scope("title")}
              />
              <MyInput
                label="Days to complete"
                type="number"
                scope={item.scope("daysToComplete")}
              />
              <Button
                variant="ghost"
                type="button"
                onClick={() =>
                  form.array("tasks").remove(index)
                }
              >
                Delete
              </Button>
            </li>
          ))}
          {form.array("tasks").length() === 0 && (
            <EmptyState>No tasks yet</EmptyState>
          )}
        </ul>
      </div>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          type="button"
          onClick={async () => {
            const nextTaskIndex = form
              .array("tasks")
              .length();
            await form.array("tasks").push({
              daysToComplete: 0,
              title: "",
            });
            form.focus(`tasks[${nextTaskIndex}].title`);
          }}
        >
          Add task
        </Button>
        <Button
          type="submit"
          isLoading={form.formState.isSubmitting}
        >
          Submit
        </Button>
      </div>
    </form>
  );
};
