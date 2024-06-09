I decided not to port over any hooks that have a corresponding hook in the rewrite.
There are a couple reasons for this:

- The new ones are reasonably similar.
- The old versions expose things that are intended as implementation details in the rewrite.
- These hooks are generally used in a small number of places and re-used across an app.
