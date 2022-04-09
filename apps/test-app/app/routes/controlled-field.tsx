import { withZod } from "@remix-validated-form/with-zod";
import { useState } from "react";
import { ActionFunction, useActionData } from "remix";
import {
  ValidatedForm,
  useControlField,
  validationError,
  useField,
  useUpdateControlledField,
} from "remix-validated-form";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { SubmitButton } from "~/components/SubmitButton";

const validator = withZod(
  z.object({
    myField: z.literal("blue"),
    text: zfd.json(z.literal("bob")),
  })
);

export const action: ActionFunction = async ({ request }) => {
  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error);
  return { message: `Color chosen is ${result.data.myField}` };
};

const Controlled = () => {
  const { error, validate } = useField("myField");
  const [value, setValue] = useControlField<string>("myField");
  const update = (value: string) => {
    setValue(value);
    validate();
  };

  return (
    <div>
      <input type="hidden" value={value} name="myField" />
      <button type="button" onClick={() => update("blue")} data-testid="blue">
        Blue{value === "blue" && " (selected)"}
      </button>
      <button type="button" onClick={() => update("green")} data-testid="green">
        Green{value === "green" && " (selected)"}
      </button>
      <button
        type="button"
        onClick={() => update("yellow")}
        data-testid="yellow"
      >
        Yellow{value === "yellow" && " (selected)"}
      </button>
      {error && (
        <p style={{ color: "red" }} data-testid="error">
          {error}
        </p>
      )}
    </div>
  );
};

const ControlledInput = () => {
  const { error, validate } = useField("text");
  const [value, setValue] = useControlField<string>("text");
  const [count, setCount] = useState(0);

  const update = (value: string) => {
    setValue(value);
    validate();
    setCount((prev) => prev + 1);
  };

  return (
    <div>
      <input type="hidden" value={value} name="text" />
      <input
        value={value}
        onChange={(e) => update(e.target.value)}
        data-testid="text-input"
      />
      {error && <p data-testid="text-error">{error}</p>}
      <p data-testid="resolution-count">{count}</p>
    </div>
  );
};

function* range(min: number, max: number) {
  for (let i = min; i < max; i++) {
    yield i;
  }
}

export default function ControlledField() {
  const data = useActionData();
  const [count, setCount] = useState(1);
  const update = useUpdateControlledField("test-form");
  return (
    <ValidatedForm
      id="test-form"
      validator={validator}
      method="post"
      defaultValues={{ myField: "green" as any }}
    >
      {data?.message && <div>{data.message}</div>}
      <div style={{ margin: "1rem" }}>
        <button type="button" onClick={() => setCount((prev) => prev + 1)}>
          +
        </button>
        <button type="button" onClick={() => setCount((prev) => prev - 1)}>
          -
        </button>
      </div>
      {[...range(0, count)].map((_, i) => (
        <Controlled key={i} />
      ))}
      <ControlledInput />
      <button
        onClick={() => update("text", "Hello from update hook")}
        type="button"
      >
        Force Update
      </button>
      <SubmitButton />
    </ValidatedForm>
  );
}
