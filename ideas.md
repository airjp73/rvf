## Use `getInputProp` like before

All the other ideas I've come up with are a bit worse versions of this.

```tsx
const MyForm = () => {
  const form = useRvf({
    defaultValues: {
      name: "",
    },
    validator: successValidator,
    onSubmit: vi.fn(),
  });

  return (
    <form {...form.getFormProps()}>
      <input
        {...form.getInputProps({
          name: "name",
          type: "number",
        })}
      />
    </form>
  );
};
```

## Remove `checkbox` and rename `control` to something else

## Remove `field` and just use `getInputProps` again

Can add other helpers later

## Remove optimizations from array helpers and remove `.isolate`

Don't need to do this, I think.

## Add components for isolation

- `<FieldArray />`
- `<Rvf />` can also do it
