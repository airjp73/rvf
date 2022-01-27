# zod-form-data

Validation helpers for [zod](https://github.com/colinhacks/zod)
specifically for parsing `FormData` or `URLSearchParams`.
This is particularly useful when using [remix](https://github.com/remix-run/remix)
and combos well with [remix-validated-form](https://github.com/airjp73/remix-validated-form).

The main goal of this library is deal with the pain point that everything in `FormData` is a string.
Sometimes, properly validating this kind of data requires a lot of extra hoop jumping and preprocessing.
With the helpers in `zod-form-data`, you can write your types closer to how you want to.

## Example

```tsx
import { zfd } from 'zod-form-data';

const schema = zfd.formData({
  name: zfd.text(),
  age: zfd.numeric(
    z.number().min(25).max(50)
  ),
  likesPizza: zfd.checkbox()
})

// This example is using `remix`, but it will work
// with any `FormData` or `URLSearchParams` no matter where you get it from.
export const action = async ({ request }) => {
  const { name, age, likesPizza } = schema.parse(await request.formData())
  // do something with parsed data
}
```

## Installation

```bash
npm install zod-form-data
```

## Contributing

The eventual goal is to have a helper to preprocess and/or validate most types of native inputs.
If you have a helper for an input type that isn't in this library, feel free to open a PR to add it!

## API Reference

Contents
* [formData](#formData)
* [text](#text)
* [numeric](#numeric)
* [checkbox](#checkbox)
* [repeatable](#repeatable)
* [repeatableOfType](#repeatableOfType)

### formData

This helper takes the place of the `z.object` at the root of your schema.
It wraps your schema in a `z.preprocess` that extracts all the data out of a `FormData`
and transforms it into a regular object.
If the `FormData` contains multiple entries with the same field name,
it will automatically turn that field into an array.
(If you're expecting multiple values for a field, use [repeatable](#repeatable).)

The primary use-case for this helper is to accept `FormData`,
but it works with any iterable that returns entries.
This means it can accept `URLSearchParams` or regular objects as well.

#### Usage

You can use this the same way you would use `z.object`.

```ts
const schema = zfd.formData({
  field1: zfd.text(),
  field2: zfd.text(),
})

const someFormData = new FormData();
const dataObject = schema.parse(someFormData);
```

### text

Transforms any empty strings to `undefined` before validating.
This makes it so empty strings will fail required checks,
allowing you to use `optional` for optional fields instead of `nonempty` for required fields.
If you call `zfd.text` with no arguments, it will assume the field is a required string by default.
If you want to customize the schema, you can pass that as an argument.

#### Usage

```ts
const const schema = zfd.formData({
  requiredString: zfd.text(),
  stringWithMinLength: zfd.text(z.string().min(10)),
  optional: zfd.text(z.string().optional()),
})
```

### numeric

Coerces numerical strings to numbers transforms empty strings to `undefined` before validating.
If you call `zfd.number` with no arguments,
it will assume the field is a required number by default.
If you want to customize the schema, you can pass that as an argument.

_Note:_ The preprocessing only _coerces_ the value into a number. It doesn't use `parseInt`.
Something like `"24px"` will not be transformed and will be treated as a string.

#### Usage

```ts
const schema = zfd.formData({
  requiredNumber: zfd.numeric(),
  numberWithMin: zfd.numeric(z.number().min(13)),
  optional: zfd.numeric(z.number().optional()),
})
```

### checkbox

Validates a checkbox field as a boolean.
Unlike other helpers, this is not a preprocesser,
but a complete schema that should do everything you need.
By default, it will treat `"on"` as true and `undefined` as false,
but you can customize the true value.

If you have a checkbox group and you want to leave the values as strings,
[repeatableField](#repeatableField) might be what you want.

#### Usage

```ts
const schema = zfd.formData({
  defaultCheckbox: zfd.checkbox(),
  checkboxWithValue: zfd.checkbox({ trueValue: "true" }),
  mustBeTrue: zfd.checkbox().refine(val => val, "Please check this box")
})
```

#### Background on native checkbox behavior

If you're used to using client-side form libraries and haven't dealt with native form behavior much,
the native checkbox behavior might be non-intuitive (it was for me).

Take this checkbox:

```tsx
<input name="myCheckbox" type="checkbox" />
```

If you check this checkbox and submit the form, the value in the `FormData` will be `"on"`.

If you add a value prop:

```tsx
<input name="myCheckbox" type="checkbox" value="someValue" />
```

Then the checked value of the checkbox will be `"someValue"` instead of `"on"`.

If you leave the checkbox unchecked,
the `FormData` will not include an entry for `myCheckbox` at all.

([Further reading](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#value))

### file

Transforms any empty File objects to `undefined` before validating.
This makes it so empty files will fail required checks,
allowing you to use `optional` for optional fields.
If you call `zfd.file` with no arguments, it will assume the field is a required file by default.

#### Usage

```ts
const schema = zfd.formData({
  requiredFile: zfd.file(),
  optional: zfd.file().optional(),
})
```

There is a unique case in Remix when using a CustomUploadHandler, 
the field will be a `File` on the client side, but an ID string (or URL) after uploading on the server.

In this case you will need the schema to switch to string on the server:

```ts
const schema = (clientSide = true) => zfd.formData({
  file: clientSide ? zfd.file() : zfd.file(z.string()),
})
```

*Note: This will return `File | string` for the type. TODO: Example of type safety for this* 

### repeatable

Preprocesses a field where you expect multiple values could be present for the same field name
and transforms the value of that field to always be an array.
This is specifically meant to work with data transformed by `zfd.formData`
(or by `remix-validated-form`).

If you don't provide a schema, it will assume the field is an array of [zfd.text](#text) fields.
If you want to customize the type of the item, but don't care about validations on the array itself,
you can use [repeatableOfType](#repeatableOfType).

#### Usage

```ts
const schema = zfd.formData({
  myCheckboxGroup: zfd.repeatable(),
  atLeastOneItem: zfd.repeatable(z.array(zfd.text()).min(1)),
})
```

### repeatableOfType

A convenience wrapper for [repeatable](#repeatable).
Instead of passing the schema for an entire array, you pass in the schema for the item type.

#### Usage

```ts
const schema = zfd.formData({
  repeatableNumberField: zfd.repeatableOfType(zfd.numeric())
})
```
