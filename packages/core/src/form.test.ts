import { createValidator } from "./createValidator";
import { createFormScope } from "./form";

it("should be able to nest scopes arbitrarily deep", () => {
  const form = createFormScope({
    defaultValues: {
      foo: {
        bar: {
          baz: "",
        },
      },
    },
    serverValidationErrors: {},
    validator: createValidator({
      validate: (data) => Promise.resolve({ data, error: undefined }),
    }),
    submitSource: "state",
    onSubmit: vi.fn(),
    onSubmitSuccess: vi.fn(),
    onSubmitFailure: vi.fn(),
    onBeforeSubmit: vi.fn(),
    onInvalidSubmit: vi.fn(),
    flags: {
      disableFocusOnError: false,
      reloadDocument: false,
    },
    formProps: { id: "test-form" },
  });

  expect(form.__field_prefix__).toBe("");

  const foo = form.scope("foo");
  expect(foo.__field_prefix__).toBe("foo");

  const bar = foo.scope("bar");
  expect(bar.__field_prefix__).toBe("foo.bar");

  const baz = bar.scope("baz");
  expect(baz.__field_prefix__).toBe("foo.bar.baz");
});
