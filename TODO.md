- Consider adding a `beforeSubmit` callback

// follows

- Globally setting some settings with a context or something.
- turn on hydrateRoot to test that mode

- Add a new bug repro template

- Maybe add a `validatePlainObject` method to `createValidator` to be more efficient

# Some breaking change notes

- Unmounting controlled fields no longer clears the value.
- `defaultValues` configured via `"path.fields"` no longer works. The default values object should be in the expected shape.
- `validate` helper returns an object of errors instead of a validation result.
