import { useForm } from "@rvf/react";
import { withZod } from "@rvf/zod";
import { z } from "zod";
import { MyInput } from "~/fields/MyInput";
import { Button } from "~/ui/button";
import { Input } from "~/ui/input";
import { Label } from "~/ui/label";

const validator = withZod(
  z.object({
    projectName: z
      .string()
      .min(1, "Projects need a name.")
      .max(50, "Must be 50 characters or less."),
    tasks: z.array(
      z.object({
        title: z
          .string()
          .min(1, "Tasks need a title.")
          .max(50, "Must be 50 characters or less."),
        daysToComplete: z.coerce.number({ required_error: "This is required" }),
      })
    ),
  })
);

export const ReactExample = () => {
  const form = useForm({
    validator,
    defaultValues: {
      projectName: "",
      tasks: [] as Array<{ title: string; daysToComplete: number }>,
    },
  });

  return (
    <form {...form.getFormProps()}>
      <MyInput label="Project name" scope={form.scope("projectName")} />

      <ul>
        {form.array("tasks").map((key, item, index) => (
          <li key={key}>
            <MyInput label="Title" scope={item.scope("title")} />
            <MyInput
              label="Days to complete"
              type="number"
              scope={item.scope("daysToComplete")}
            />
            <Button
              variant="ghost"
              type="button"
              onClick={() => form.array("tasks").remove(index)}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>

      <div className="flex justify-between">
        <Button
          variant="secondary"
          type="button"
          onClick={() =>
            form.array("tasks").push({
              daysToComplete: 0,
              title: "",
            })
          }
        >
          Add task
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
};
