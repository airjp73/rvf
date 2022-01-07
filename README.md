# Remix Validated Form

A form library built for [remix](https://remix.run) to make validation easy.

- Client-side, field-by-field validation (e.g. validate on blur) and form-level validation
- Set default values for the entire form in one place
- Re-use validation on the server
- Show validation errors from the server even without JS
- Detect if the current form is submitting when there are multiple forms on the page
- Supports nested objects and arrays
- Validation library agnostic

# Docs

The docs are located a [remix-validated-form.io](https://www.remix-validated-form.io).

# Demo

https://user-images.githubusercontent.com/2811287/145734901-700a5085-a10b-4d89-88e1-5de9142b1e85.mov

To run `sample-app`:

```
git clone https://github.com/airjp73/remix-validated-form
cd ./remix-validated-form
yarn install
yarn sample-app
```

# Getting started

## Install

### Base package

```bash
npm install remix-validated-form
```

### Validation library adapter

There are official adapters available for `zod` and `yup`.
If you're using a different library,
see the [Validation library support](#validation-library-support) section below.

- @remix-validated-form/with-zod
- @remix-validated-form/with-yup

```bash
npm install @remix-validated-form/with-zod
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
import { useFormContext, useIsSubmitting } from "remix-validated-form";

export const MySubmitButton = () => {
  const isSubmitting = useIsSubmitting();
  const { isValid } = useFormContext();
  const disabled = isSubmitting || !isValid;

  return (
    <button type="submit" disabled={disabled} className={disabled ? "disabled-btn" : "btn"}>
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
  const fieldValues = validator.validate(await request.formData());
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

## Nested objects and arrays

You can use nested objects and arrays by using a period (`.`) or brackets (`[]`) for the field names.

```tsx
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
      <MyInput name="address.street" label="Street" />
      <MyInput name="address.city" label="City" />
      <MyInput name="phones[0].type" label="Phone 1 Type" />
      <MyInput name="phones[0].number" label="Phone 1 Number" />
      <MyInput name="phones[1].type" label="Phone 2 Type" />
      <MyInput name="phones[1].number" label="Phone 2 Number" />
      <MySubmitButton />
    </ValidatedForm>
  );
}
```

# Validation Library Support

There are official adapters available for `zod` and `yup` ,
but you can easily support whatever library you want by creating your own adapter.

And if you create an adapter for a library, feel free to make a PR on this repository 😊

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

Note the use of `createValidator`.
It takes care of unflattening the data for nested objects and arrays
since the form doesn't know anything about object and arrays and this should be handled by the adapter.
For more on this you can check the implementations for `withZod` and `withYup`.

The out-of-the-box support for `yup` in this library works like this:

```ts
export const withYup = <Schema extends AnyObjectSchema>(
  validationSchema: Schema
  // For best result with Typescript, we should type the `Validator` we return based on the provided schema
): Validator<InferType<Schema>> =>
  createValidator({
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

# Frequenty Asked Questions

## Why are my fields triggering the native HTML validations before `remix-validated-form` ones?

This is happening because you or the library you are using is passing the `required` attribute to the fields.
This library doesn't take care of eliminating them and it's up to the user how they want to manage the validation errors.
If you wan't to disable all native HTML validations you can add `noValidate` to `<ValidatedForm>`.
We recommend this approach since the validation will still work even if JS is disabled.

## How do we trigger toast messages on success?

Problem: how do we trigger a toast message on success if the action redirects away from the form route? The Remix solution is to flash a message in the session and pick this up in a loader function, probably in root.tsx
See the [Remix](https://remix.run/docs/en/v1/api/remix#sessionflashkey-value) documentation for more information.

## Why is my cancel button triggering form submission?
Problem: the cancel button has an onClick handler to navigate away from the form route but instead it is submitting the form.
A button defaults to `type="submit"` in a form which will submit the form by default. If you want to prevent this you can add `type="reset"` or `type="button"` to the cancel button.