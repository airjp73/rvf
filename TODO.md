In DOM mode, is it a good idea to clear out the value of a field when it's removed from the DOM?
This would be consistent with how the native browser handles it. and how we handle it currently.
My end-goal is for state mode _not_ to do that, but whether or not that should be the default requires more thought.
Alternately, a `clearOnUnmount` option could be added?

- State submit without handleSubmit on remix side? Looks like remix supports doing this as json _or_ serializing as form data.
- Maybe have `validationError` construct a `Response` so we don't have to depend on `@remix-run/node`

- Add a new bug repro template
