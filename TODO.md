- Maybe replace `resetAfterSubmit` with `onSubmitSuccess` and `onSubmitFailure` callbacks
- Consider adding a `beforeSubmit` callback

// follows

- `resetAfterSubmit` could be moved to the react core
- Globally setting some settings with a context or something.
- turn on hydrateRoot to test that mode

- Find an edge-case where `getAllErrors` returns an error that `useField().error()` doesn't.
  I think using validationBehaviorConfig will result in inconsistent behavior here.

- Add a new bug repro template

- Maybe add a `validatePlainObject` method to `createValidator` to be more efficient

# Breaking change notes

- Unmounting controlled fields no longer clears the value.
- `defaultValues` configured via `"path.fields"` no longer works. The default values object should be in the expected shape.
- `validate` helper returns an object of errors instead of a validation result.
