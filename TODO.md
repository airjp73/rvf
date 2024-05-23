- flesh-out store-level array tests to have checks for all operations for nested arrays
- Make sure we can handle file inputs
- State submit without handleSubmit on remix side? Looks like remix supports doing this as json _or_ serializing as form data.
- Maybe have `validationError` construct a `Response` so we don't have to depend on `@remix-run/node`
- rename handleSubmit to action

// follows

- `resetAfterSubmit` could be moved to the react core
- Globally setting some settings with a context or something.
- turn on hydrateRoot to test that mode

- Find an edge-case where `getAllErrors` returns an error that `useField().error()` doesn't.
  I think using validationBehaviorConfig will result in inconsistent behavior here.

- Add a new bug repro template

# Breaking change notes

- Unmounting controlled fields no longer clears the value.
- `defaultValues` configured via `"path.fields"` no longer works. The default values object should be in the expected shape.
