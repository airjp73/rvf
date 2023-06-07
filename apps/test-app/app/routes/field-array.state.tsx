import { withZod } from "@remix-validated-form/with-zod";
import { nanoid } from "nanoid";
import { useState } from "react";
import { ValidatedForm, useFieldArray } from "remix-validated-form";
import { z } from "zod";
import { InputWithTouched } from "~/components/InputWithTouched";

const validator = withZod(
  z.object({
    counters: z.array(z.object({})),
  })
);

const defaultValues = {
  counters: [],
};

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <div data-testid="value">{count}</div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
    </div>
  );
};

export default function FrontendValidation() {
  const [items, { swap, insert, unshift, replace, push, remove }, error] =
    useFieldArray("counters", { formId: "form" });
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      defaultValues={defaultValues}
      id="form"
    >
      {items.map(({ key }, index) => (
        <div key={key} data-testid={`counter-${index}`}>
          <Counter key={key} />
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
      <button type="button" onClick={() => swap(0, 1)}>
        Swap
      </button>
      <button type="button" onClick={() => insert(1, {})}>
        Insert
      </button>
      <button type="button" onClick={() => unshift({})}>
        Unshift
      </button>
      <button type="button" onClick={() => replace(1, {})}>
        Replace
      </button>
      <button type="button" onClick={() => push({})}>
        Push
      </button>
      <button type="reset">Reset</button>
      <button type="submit">Submit</button>
      {error && <div>{error}</div>}
    </ValidatedForm>
  );
}
