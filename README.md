# RVF

(Formerly Remix Validated Form)

Easy form validation and state management for React.

Easy form validation and state management for React.

### Progressively enhanced

RVF leans into native form APIs, so it's easy to add to your existing forms.
It even works without JavaScript on the client if you're using a server-rendered framework like [Remix](https://remix.run).

### Powerful

When you need to scale up and write bigger, more complicated forms, RVF can scale with you.

- Easily manages nested objects and arrays in at typesafe way -- even when they're recursive.
- Set default values for the whole form in one place.
- Re-use your validation on the server.

## Docs

The docs are located a [rvf-js.io](https://rvf-js.io).

## Simple example

> [!Note]
> See this example in action on the [documention site](https://rvf-js.io).

<details>
<summary>Plain React</summary>

```tsx
import { useForm } from "@rvf/react";
import { withZod } from "@rvf/zod";
import { z } from "zod";
import { MyInput } from "~/fields/MyInput";
import { Button } from "~/ui/button";
import { createProject } from "./api";
import { ErrorMessage } from "~/fields/ErrorMessage";
import { showToastMessage } from "~/lib/utils";
import { EmptyState } from "~/ui/empty-state";

const validator = withZod(
  z.object({
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
  }),
);

export const ReactExample = () => {
  const form = useForm({
    validator,
    defaultValues: {
      projectName: "",
      tasks: [] as Array<{ title: string; daysToComplete: number }>,
      file: "" as File | "",
    },
    handleSubmit: async ({ projectName, tasks }) => {
      await createProject({ name: projectName, tasks });
      return projectName;
    },
    onSubmitSuccess: (projectName) => {
      showToastMessage(`Project ${projectName} created!`);
      form.resetForm();
    },
  });

  return (
    <form {...form.getFormProps()}>
      <MyInput label="Project name" scope={form.scope("projectName")} />

      <div>
        <h3>Tasks</h3>
        {form.error("tasks") && (
          <ErrorMessage>{form.error("tasks")}</ErrorMessage>
        )}
        <hr />

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
            const nextTaskIndex = form.array("tasks").length();
            await form.array("tasks").push({
              daysToComplete: 0,
              title: "",
            });
            form.focus(`tasks[${nextTaskIndex}].title`);
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
```

</details>

<details>
<summary>Remix</summary>

```tsx
import {
  isValidationErrorResponse,
  useForm,
  validationError,
} from "@rvf/remix";
import { withZod } from "@rvf/zod";
import { z } from "zod";
import { MyInput } from "~/fields/MyInput";
import { Button } from "~/ui/button";
import { createProject } from "./api";
import { ErrorMessage } from "~/fields/ErrorMessage";
import { showToastMessage } from "~/lib/utils";
import { EmptyState } from "~/ui/empty-state";
import { json, useActionData } from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";

const validator = withZod(
  z.object({
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
  }),
);

export const action = async ({ request }: ActionFunctionArgs) => {
  const data = await validator.validate(await request.formData());
  if (data.error) return validationError(data.error);

  const { projectName, tasks } = data.data;

  await createProject({ name: projectName, tasks });
  return json({ projectName });
};

export const ReactExample = () => {
  const data = useActionData<typeof action>();
  const form = useForm({
    validator,
    defaultValues: {
      projectName: "",
      tasks: [] as Array<{ title: string; daysToComplete: number }>,
    },
    onSubmitSuccess: () => {
      // We know this isn't an error in the success callback, but Typescript doesn't
      if (isValidationErrorResponse(data)) return;

      // This isn't always the best way to show a toast in remix.
      // https://www.jacobparis.com/content/remix-form-toast
      showToastMessage(`Project ${data?.projectName} created!`);
      form.resetForm();
    },
  });

  return (
    <form {...form.getFormProps()}>
      <MyInput label="Project name" scope={form.scope("projectName")} />

      <div>
        <h3>Tasks</h3>
        {form.error("tasks") && (
          <ErrorMessage>{form.error("tasks")}</ErrorMessage>
        )}
        <hr />

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
            const nextTaskIndex = form.array("tasks").length();
            await form.array("tasks").push({
              daysToComplete: 0,
              title: "",
            });
            form.focus(`tasks[${nextTaskIndex}].title`);
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
```

</details>

## Getting started

### Install

RVF can be used with any flavor of React, but there's also an adapter specifically for [Remix](https://remix.run).

- @rvf/remix
- @rvf/react

For Remix users:

```bash
npm install @rvf/remix
```

For plain React or other frameworks like Next.js:

```bash
npm install @rvf/react
```

#### Validation library adapter

There are official adapters available for `zod` and `yup`.
If you're using a different library, see the [Validation library support](http://rvf-js.io/validation-library-support) seciton of the docs..

- @rvf/zod
- @rvf/yup

For Zod users:

```bash
npm install @rvf/zod
```

For Yup users:

```bash
npm install @rvf/yup
```

## Further reading

For more details on how to use RVF, check out the [documentation site](https://rvf-js.io).
