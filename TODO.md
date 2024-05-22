In DOM mode, is it a good idea to clear out the value of a field when it's removed from the DOM?
This would be consistent with how the native browser handles it. and how we handle it currently.
My end-goal is for state mode _not_ to do that, but whether or not that should be the default requires more thought.
Alternately, a `clearOnUnmount` option could be added?

- Globally setting some settings with a context or something.
- State submit without handleSubmit on remix side? Looks like remix supports doing this as json _or_ serializing as form data.
- `resetAfterSubmit` could be moved to the react core
- Maybe have `validationError` construct a `Response` so we don't have to depend on `@remix-run/node`
- turn on hydrateRoot to test that mode

- Find an edge-case where `getAllErrors` returns an error that `useField().error()` doesn't.
  I think using validationBehaviorConfig will result in inconsistent behavior here.

- Add a new bug repro template
