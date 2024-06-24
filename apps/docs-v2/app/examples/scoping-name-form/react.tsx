import { FormScope, useForm, useFormScope } from "@rvf/react";
import { withZod } from "@rvf/zod";
import { z } from "zod";
import { Button } from "~/ui/button";
import { createProject } from "./api";
import { showToastMessage } from "~/lib/utils";
import { EmptyState } from "~/ui/empty-state";
import { MyInput } from "~/fields/MyInput";

const personSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Must be a valid email"),
});
type Person = z.infer<typeof personSchema>;

const validator = withZod(
  z.object({
    projectLead: personSchema,
    assignees: z.array(personSchema),
  }),
);

type PersonFormProps = {
  scope: FormScope<Person>;
};

const PersonForm = ({ scope }: PersonFormProps) => {
  const form = useFormScope(scope);
  return (
    <div>
      <MyInput label="Name" scope={form.scope("name")} />
      <MyInput label="Email" scope={form.scope("email")} />
    </div>
  );
};

export const ReactExample = () => {
  const form = useForm({
    validator,
    defaultValues: {
      projectLead: { name: "", email: "" } satisfies Person,
      assignees: [] as Array<Person>,
    },
    handleSubmit: (data) => createProject(data),
    resetAfterSubmit: true,
    onSubmitSuccess: () => showToastMessage("Project created!"),
  });

  return (
    <form {...form.getFormProps()}>
      <h3>Project Lead</h3>
      <PersonForm scope={form.scope("projectLead")} />

      <h3>Tasks</h3>

      <ul>
        {form.array("assignees").map((key, item, index) => (
          <li key={key}>
            <PersonForm scope={item.scope()} />
          </li>
        ))}
        {form.array("assignees").length() === 0 && (
          <EmptyState>No tasks yet</EmptyState>
        )}
      </ul>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          type="button"
          onClick={async () => {
            await form.array("assignees").push({
              name: "",
              email: "",
            });
          }}
        >
          Add task
        </Button>
        <Button type="submit" isLoading={form.formState.isSubmitting}>
          Submit
        </Button>
      </div>
    </form>
  );
};
