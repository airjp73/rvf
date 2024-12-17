import { withZod } from "@rvf/zod";
import { nanoid } from "nanoid";
import { useState } from "react";
import {
  ValidatedForm,
  useFieldArray,
  useForm,
} from "../../../../packages/react-router/dist";
import { z } from "zod";
import { InputWithTouched } from "~/components/InputWithTouched";

const validator = withZod(
  z.object({
    counters: z.array(z.object({})),
  }),
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
  const form = useForm({
    validator,
    method: "post",
    defaultValues,
    id: "form",
  });

  const array = useFieldArray(form.scope("counters"));

  return (
    <form {...form.getFormProps()}>
      {array.map((key, item, index) => (
        <div key={key} data-testid={`counter-${index}`}>
          <Counter key={key} />
          <button
            type="button"
            onClick={() => {
              array.remove(index);
            }}
          >
            Delete todo
          </button>
        </div>
      ))}
      <button type="button" onClick={() => array.swap(0, 1)}>
        Swap
      </button>
      <button type="button" onClick={() => array.insert(1, {} as never)}>
        Insert
      </button>
      <button type="button" onClick={() => array.unshift({} as never)}>
        Unshift
      </button>
      <button type="button" onClick={() => array.replace(1, {} as never)}>
        Replace
      </button>
      <button type="button" onClick={() => array.push({} as never)}>
        Push
      </button>
      <button type="reset">Reset</button>
      <button type="submit">Submit</button>
      {array.error() && <div>{array.error()}</div>}
    </form>
  );
}
