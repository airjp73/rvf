# Remix Validated Form

A form library built for [remix](https://remix.run) to make validation easy.

- Client-side, field-by-field validation (e.g. validate on blur) and form-level validation
- Set default values for the entire form in one place
- Re-use validation on the server
- Show validation errors from the server even without JS
- Detect if the current form is submitting when there are multiple forms on the page
- Validation library agnostic

# Demo

https://user-images.githubusercontent.com/25882770/143505448-c4b7e660-7a73-4005-b2ca-17c65a15ef46.mov

# Getting started

## Install

```bash
npm install remix-validated-form
```

## Create an input component

In order to display field errors or do field-by-field validation,
it's recommended to incorporate this library into an input component using `useField`.

```tsx
import { useField } from "remix-validated-form";

type MyInputProps = {
  name: string;
  label: string;
};

export const MyInput = ({ name, label }: InputProps) => {
  const { validate, clearError, defaultValue, error } = useField(name);
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        onBlur={validate}
        onChange={clearError}
        defaultValue={defaultValue}
      />
      {error && <span className="my-error-class">{error}</span>}
    </div>
  );
};
```

## Create a submit button component

To best take advantage of the per-form submission detection, we can create a submit button component.

```tsx
import { useIsSubmitting } from "../../remix-validated-form";

export const MySubmitButton = () => {
  const isSubmitting = useIsSubmitting();
  return (
    <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Submitting..." : "Submit"}
    </button>
  );
};
```

## Use the form!

Now that we have our components, making a form is easy!

```tsx
import { ActionFunction, LoaderFunction, redirect, useLoaderData } from "remix";
import * as yup from "yup";
import { validationError, ValidatedForm, withYup } from "remix-validated-form";
import { MyInput, MySubmitButton } from "~/components/Input";

// Using yup in this example, but you can use anything
const validator = withYup(
  yup.object({
    firstName: yup.string().label("First Name").required(),
    lastName: yup.string().label("Last Name").required(),
    email: yup.string().email().label("Email").required(),
  })
);

export const action: ActionFunction = async ({ request }) => {
  const fieldValues = validator.validate(
    Object.fromEntries(await request.formData())
  );
  if (fieldValues.error) return validationError(fieldValues.error);
  const { firstName, lastName, email } = fieldValues.data;

  // Do something with correctly typed values;

  return redirect("/");
};

export const loader: LoaderFunction = () => {
  return {
    defaultValues: {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
    },
  };
};

export default function MyForm() {
  const { defaultValues } = useLoaderData();
  return (
    <ValidatedForm
      validator={validator}
      method="post"
      defaultValues={defaultValues}
    >
      <MyInput name="firstName" label="First Name" />
      <MyInput name="lastName" label="Last Name" />
      <MyInput name="email" label="Email" />
      <MySubmitButton />
    </ValidatedForm>
  );
}
```

# Validation Library Support

This library currently includes an out-of-the-box adapter for `yup` and `zod`,
but you can easily support whatever library you want by creating your own adapter.

And if you create an adapter for a library, feel free to make a PR on this library to add official support 😊

## Creating an adapter

Any object that conforms to the `Validator` type can be passed into the the `ValidatedForm`'s `validator` prop.

```ts
type FieldErrors = Record<string, string>;

type ValidationResult<DataType> =
  | { data: DataType; error: undefined }
  | { error: FieldErrors; data: undefined };

type ValidateFieldResult = { error?: string };

type Validator<DataType> = {
  validate: (unvalidatedData: unknown) => ValidationResult<DataType>;
  validateField: (
    unvalidatedData: unknown,
    field: string
  ) => ValidateFieldResult;
};
```

In order to make an adapter for your validation library of choice,
you can create a function that accepts a schema from the validation library and turns it into a validator.

The out-of-the-box support for `yup` in this library works like this:

```ts
export const withYup = <Schema extends AnyObjectSchema>(
  validationSchema: Schema
  // For best result with Typescript, we should type the `Validator` we return based on the provided schema
): Validator<InferType<Schema>> => ({
  validate: (unvalidatedData) => {
    // Validate with yup and return the validated & typed data or the error

    if (isValid) return { data: { field1: "someValue" }, error: undefined };
    else return { error: { field1: "Some error!" }, data: undefined };
  },
  validateField: (unvalidatedData, field) => {
    // Validate the specific field with yup

    if (isValid) return { error: undefined };
    else return { error: "Some error" };
  },
});
```
