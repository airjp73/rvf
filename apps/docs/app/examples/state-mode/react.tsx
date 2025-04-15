import { useForm } from "@rvf/react";
import { z } from "zod";
import { Button } from "~/ui/button";
import { showToastMessage } from "~/lib/utils";
import { ErrorMessage } from "~/fields/ErrorMessage";

const schema = z.object({
  selectedUser: z.object(
    {
      name: z.string(),
      // We don't have to validate this as a string and transform it
      age: z.number(),
    },
    {
      required_error: "Please choose a user",
    },
  ),
});

type User = {
  name: string;
  age: number;
};

export const ReactExample = () => {
  const form = useForm({
    submitSource: "state",
    schema,
    defaultValues: {
      selectedUser: undefined as undefined | User,
    },
    handleSubmit: (data) =>
      showToastMessage(
        `You chose ${data.selectedUser.name}, who is ${data.selectedUser.age} years old`,
      ),
    resetAfterSubmit: true,
  });

  return (
    <form {...form.getFormProps()}>
      <h3>Select a user</h3>
      <fieldset>
        <legend>User</legend>
        <label>
          <input
            type="radio"
            checked={
              form.value("selectedUser")?.name === "Jim"
            }
            onClick={() =>
              form.setValue("selectedUser", {
                name: "Jim",
                age: 30,
              })
            }
          />
          Jim
        </label>

        <label>
          <input
            checked={
              form.value("selectedUser")?.name === "Pedro"
            }
            type="radio"
            onClick={() =>
              form.setValue("selectedUser", {
                name: "Pedro",
                age: 23,
              })
            }
          />
          Pedro
        </label>

        <label>
          <input
            type="radio"
            checked={
              form.value("selectedUser")?.name === "Quinta"
            }
            onClick={() =>
              form.setValue("selectedUser", {
                name: "Quinta",
                age: 28,
              })
            }
          />
          Quinta
        </label>
      </fieldset>

      <div aria-live="polite">
        {form.error("selectedUser") && (
          <ErrorMessage>
            {form.error("selectedUser")}
          </ErrorMessage>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
};
