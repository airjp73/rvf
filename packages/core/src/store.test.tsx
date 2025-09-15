import { describe, expect, it, vi } from "vitest";
import {
  FormStoreInit,
  createFormStateStore,
  createRefStore,
  createResolverQueue,
} from "./store";
import { ValidationBehavior } from "./types";
import { createValidator } from "./createValidator";
import {
  getAllErrors,
  getFieldDefaultValue,
  getFieldError,
  getFieldValue,
} from "./getters";
import { FormEventListener } from "./formEventListener";

const mockEventListener = {
  onFieldSetValue: vi.fn(),
  onFieldChange: vi.fn(),
  onFieldReset: vi.fn(),
  onFormReset: vi.fn(),
  onArrayPush: vi.fn(),
  onArrayPop: vi.fn(),
  onArrayShift: vi.fn(),
  onArrayUnshift: vi.fn(),
  onArrayInsert: vi.fn(),
  onArrayMove: vi.fn(),
  onArrayRemove: vi.fn(),
  onArraySwap: vi.fn(),
  onArrayReplace: vi.fn(),
} satisfies Required<FormEventListener>;

const testStore = (init?: Partial<FormStoreInit>) =>
  createFormStateStore({
    defaultValues: {},
    controlledFieldRefs: createRefStore(),
    transientFieldRefs: createRefStore(),
    fieldSerializerRefs: createRefStore(),
    resolvers: createResolverQueue(),
    formRef: { current: null },
    submitSource: "state",
    mutableImplStore: {
      onSubmitFailure: vi.fn(),
      onSubmitSuccess: vi.fn(),
      onBeforeSubmit: vi.fn(),
      onInvalidSubmit: vi.fn(),
      validator: createValidator({
        validate: () => Promise.resolve({ data: null, error: undefined }),
      }),
      onSubmit: () => Promise.resolve(),
      experimental_eventListener: mockEventListener,
    },
    flags: {
      disableFocusOnError: false,
      reloadDocument: false,
    },
    serverValidationErrors: {},
    formProps: {
      id: "test-form",
    },
    defaultFormId: "test-form",
    ...init,
  });

describe("validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate using the provided validator at the right time", async () => {
    const onSubmit = vi.fn();
    const store = testStore({
      mutableImplStore: {
        onSubmitFailure: vi.fn(),
        onSubmitSuccess: vi.fn(),
        onBeforeSubmit: vi.fn(),
        onInvalidSubmit: vi.fn(),
        validator: createValidator({
          validate: (data) => {
            if (data.firstName === "Jane")
              return Promise.resolve({
                error: { firstName: "Invalid" },
                data: undefined,
              });
            return Promise.resolve({
              data: { transformed: "data" },
              error: undefined,
            });
          },
        }),
        onSubmit,
        experimental_eventListener: mockEventListener,
      },
    });
    store.setState({
      values: {
        firstName: "John",
        lastName: "Doe",
      },
    });
    expect(store.getState().validationErrors).toEqual({});

    store.getState().onFieldChange("firstName", "Jane");
    expect(store.getState().touchedFields).toEqual({});
    expect(store.getState().dirtyFields).toEqual({ firstName: true });
    expect(store.getState().validationErrors).toEqual({});
    expect(mockEventListener.onFieldChange).toHaveBeenCalledWith(
      "firstName",
      "Jane",
    );

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(store.getState().validationErrors).toEqual({});

    store.getState().onSubmit();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(store.getState().validationErrors).toEqual({
      firstName: "Invalid",
    });
    expect(onSubmit).not.toHaveBeenCalled();

    store.getState().onFieldChange("firstName", "John again");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(store.getState().validationErrors).toEqual({});
    expect(mockEventListener.onFieldChange).toHaveBeenCalledWith(
      "firstName",
      "John again",
    );

    store.getState().onSubmit();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(store.getState().validationErrors).toEqual({});
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ transformed: "data" }, {});
  });

  it("should be possible to set the validation behavior on demand for a given event", async () => {
    const onSubmit = vi.fn();
    const store = testStore({
      mutableImplStore: {
        onSubmitSuccess: vi.fn(),
        onSubmitFailure: vi.fn(),
        onBeforeSubmit: vi.fn(),
        onInvalidSubmit: vi.fn(),
        validator: createValidator({
          validate: (data) => {
            if (data.firstName === "Jane")
              return Promise.resolve({
                error: { firstName: "Invalid" },
                data: undefined,
              });
            return Promise.resolve({
              data: { transformed: "data" },
              error: undefined,
            });
          },
        }),
        onSubmit,
        experimental_eventListener: mockEventListener,
      },
    });
    store.setState({
      values: {
        firstName: "John",
        lastName: "Doe",
      },
    });
    expect(store.getState().validationErrors).toEqual({});

    const behavior = (b: ValidationBehavior) => ({
      initial: b,
      whenTouched: b,
      whenSubmitted: b,
    });

    store.getState().onFieldChange("firstName", "Jane", behavior("onBlur"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(store.getState().validationErrors).toEqual({});
    expect(mockEventListener.onFieldChange).toHaveBeenCalledWith(
      "firstName",
      "Jane",
    );

    store.getState().onFieldChange("firstName", "Jane", behavior("onChange"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(store.getState().validationErrors).toEqual({
      firstName: "Invalid",
    });

    store.getState().setValue("firstName", "John");
    store.getState().onFieldBlur("firstName", behavior("onSubmit"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(store.getState().validationErrors).toEqual({
      firstName: "Invalid",
    });

    store.getState().onFieldBlur("firstName", behavior("onBlur"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(store.getState().validationErrors).toEqual({});

    store.getState().onFieldChange("firstName", "Jane", behavior("onChange"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(store.getState().validationErrors).toEqual({
      firstName: "Invalid",
    });

    // Always gets cleared on change
    store.getState().onFieldChange("firstName", "John", behavior("onBlur"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(store.getState().validationErrors).toEqual({});
  });
});

describe("arrays", () => {
  it("should push into arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz"],
      },
      touchedFields: {
        "foo[0]": true,
      },
      dirtyFields: {
        "foo[0]": true,
      },
      validationErrors: {
        "foo[1]": "not equal",
      },
      fieldArrayKeys: {
        foo: ["foo[0]", "foo[1]"],
      },
    });
    store.getState().arrayPush("foo", "quux");
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: ["bar", "baz", "quux"],
      },
      defaultValueOverrides: {
        "foo[2]": "quux",
      },
      touchedFields: {
        "foo[0]": true,
      },
      dirtyFields: {
        "foo[0]": true,
      },
      validationErrors: {
        "foo[1]": "not equal",
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(3);
    expect(mockEventListener.onArrayPush).toHaveBeenCalledWith("foo", "quux");
  });

  it("should push into arrays with no field array", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz"],
      },
      touchedFields: {
        "foo[0]": true,
      },
      dirtyFields: {
        "foo[0]": true,
      },
      validationErrors: {
        "foo[1]": "not equal",
      },
    });
    store.getState().arrayPush("foo", "quux");
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: ["bar", "baz", "quux"],
      },
      defaultValueOverrides: {
        "foo[2]": "quux",
      },
      touchedFields: {
        "foo[0]": true,
      },
      dirtyFields: {
        "foo[0]": true,
      },
      validationErrors: {
        "foo[1]": "not equal",
      },
    });
    expect(mockEventListener.onArrayPush).toHaveBeenCalledWith("foo", "quux");
  });

  it("should be able to be called in quick succession", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar"],
        bar: [],
      },
      fieldArrayKeys: {
        foo: ["bar"],
        bar: [],
      },
    });
    const { arrayRemove, arrayInsert } = store.getState();
    arrayRemove("foo", 0);
    arrayInsert("bar", 0, "bar");
    const { values, fieldArrayKeys } = store.getState();
    expect({ values, fieldArrayKeys }).toEqual({
      values: {
        foo: [],
        bar: ["bar"],
      },
      fieldArrayKeys: {
        foo: [],
        bar: [expect.any(String)],
      },
    });
    expect(mockEventListener.onArrayRemove).toHaveBeenCalledWith("foo", 0);
    expect(mockEventListener.onArrayInsert).toHaveBeenCalledWith(
      "bar",
      0,
      "bar",
    );
  });

  it("should push into nested arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: [{ name: "bar", notes: [{ text: "baz" }] }],
      },
      touchedFields: {
        "foo[0].name": true,
      },
      dirtyFields: {
        "foo[0].name": true,
      },
      validationErrors: {
        "foo[0].notes[1]": "not equal",
      },
      fieldArrayKeys: {
        foo: ["a"],
        "foo[0].notes": ["a"],
      },
    });
    store.getState().arrayPush("foo[0].notes", { text: "quux" });
    expect(mockEventListener.onArrayPush).toHaveBeenCalledWith("foo[0].notes", {
      text: "quux",
    });
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: [{ name: "bar", notes: [{ text: "baz" }, { text: "quux" }] }],
      },
      defaultValueOverrides: {
        "foo[0].notes[1]": { text: "quux" },
      },
      touchedFields: {
        "foo[0].name": true,
      },
      dirtyFields: {
        "foo[0].name": true,
      },
      validationErrors: {
        "foo[0].notes[1]": "not equal",
      },
    });
    expect(fieldArrayKeys["foo[0].notes"]).toHaveLength(2);
  });

  it("should pop from arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz"],
      },
      defaultValueOverrides: {
        "foo[0]": "bar",
        "foo[1]": "baz",
      },
      touchedFields: {
        "foo[0]": true,
        "foo[1]": true,
      },
      dirtyFields: {
        "foo[0]": true,
        "foo[1]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
        "foo[1]": "not equal",
      },
      fieldArrayKeys: {
        foo: ["foo[0]", "foo[1]"],
      },
    });
    store.getState().arrayPop("foo");
    expect(mockEventListener.onArrayPop).toHaveBeenCalledWith("foo");
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: ["bar"],
      },
      defaultValueOverrides: {
        "foo[0]": "bar",
      },
      touchedFields: {
        "foo[0]": true,
      },
      dirtyFields: {
        "foo[0]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(1);
  });

  it("should pop from arrays with no field array keys", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz"],
      },
      defaultValueOverrides: {
        "foo[0]": "bar",
        "foo[1]": "baz",
      },
      touchedFields: {
        "foo[0]": true,
        "foo[1]": true,
      },
      dirtyFields: {
        "foo[0]": true,
        "foo[1]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
        "foo[1]": "not equal",
      },
    });
    store.getState().arrayPop("foo");
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: ["bar"],
      },
      defaultValueOverrides: {
        "foo[0]": "bar",
      },
      touchedFields: {
        "foo[0]": true,
      },
      dirtyFields: {
        "foo[0]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
      },
    });
  });

  it("should pop from nested arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: [
          { name: "bar", notes: [{ text: "baz" }, { text: "another" }] },
          { name: "value", notes: [{ text: "thing" }] },
        ],
      },
      defaultValueOverrides: {
        "foo[0].notes[0]": { text: "baz" },
        "foo[0].notes[1]": { text: "bar" },
      },
      touchedFields: {},
      dirtyFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["a", "b"],
        "foo[0].notes": ["a", "b"],
        "foo[1].notes": ["a"],
      },
    });
    store.getState().arrayPop("foo[0].notes");
    expect(mockEventListener.onArrayPop).toHaveBeenCalledWith("foo[0].notes");
    let {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: [
          { name: "bar", notes: [{ text: "baz" }] },
          { name: "value", notes: [{ text: "thing" }] },
        ],
      },
      defaultValueOverrides: {
        "foo[0].notes[0]": { text: "baz" },
      },
      dirtyFields: {},
      touchedFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["a", "b"],
        "foo[0].notes": ["a"],
        "foo[1].notes": ["a"],
      },
    });

    store.getState().arrayPop("foo");
    expect(mockEventListener.onArrayPop).toHaveBeenCalledWith("foo");
    ({ values, touchedFields, dirtyFields, validationErrors, fieldArrayKeys } =
      store.getState());
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    }).toEqual({
      values: {
        foo: [{ name: "bar", notes: [{ text: "baz" }] }],
      },
      dirtyFields: {},
      touchedFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["a"],
        "foo[0].notes": ["a"],
      },
    });
  });

  it("should shift from arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz"],
      },
      defaultValueOverrides: {
        "foo[0]": "bar",
        "foo[1]": "baz",
      },
      touchedFields: {
        "foo[0]": false,
        "foo[1]": true,
      },
      dirtyFields: {
        "foo[0]": false,
        "foo[1]": true,
      },
      validationErrors: {
        "foo[0]": "equal",
        "foo[1]": "not equal",
      },
      fieldArrayKeys: {
        foo: ["foo[0]", "foo[1]"],
      },
    });
    store.getState().arrayShift("foo");
    expect(mockEventListener.onArrayShift).toHaveBeenCalledWith("foo");
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: ["baz"],
      },
      defaultValueOverrides: {
        "foo[0]": "baz",
      },
      touchedFields: {
        "foo[0]": true,
      },
      dirtyFields: {
        "foo[0]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(1);
  });

  it("should shift from nested arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: [
          { name: "bar", notes: [{ text: "baz" }, { text: "another" }] },
          { name: "value", notes: [{ text: "thing" }] },
        ],
      },
      defaultValueOverrides: {
        "foo[0].notes[0]": { text: "bob" },
        "foo[0].notes[1].text": "jim",
      },
      touchedFields: {},
      dirtyFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["a", "b"],
        "foo[0].notes": ["a", "b"],
        "foo[1].notes": ["a"],
      },
    });
    store.getState().arrayShift("foo[0].notes");
    expect(mockEventListener.onArrayShift).toHaveBeenCalledWith("foo[0].notes");
    let {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: [
          { name: "bar", notes: [{ text: "another" }] },
          { name: "value", notes: [{ text: "thing" }] },
        ],
      },
      defaultValueOverrides: {
        "foo[0].notes[0].text": "jim",
      },
      dirtyFields: {},
      touchedFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["a", "b"],
        "foo[0].notes": ["b"],
        "foo[1].notes": ["a"],
      },
    });

    store.getState().arrayShift("foo");
    ({ values, touchedFields, dirtyFields, validationErrors, fieldArrayKeys } =
      store.getState());
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    }).toEqual({
      values: {
        foo: [{ name: "value", notes: [{ text: "thing" }] }],
      },
      dirtyFields: {},
      touchedFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["b"],
        "foo[0].notes": ["a"],
      },
    });
  });

  it("should unshift to arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz"],
      },
      defaultValueOverrides: {
        foo: ["bar", "baz"],
        "foo[0]": "jim",
      },
      touchedFields: {
        "foo[0]": true,
        "foo[1]": true,
      },
      dirtyFields: {
        "foo[0]": true,
        "foo[1]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
        "foo[1]": "not equal",
      },
      fieldArrayKeys: {
        foo: ["foo[0]", "foo[1]"],
      },
    });
    store.getState().arrayUnshift("foo", "quux");
    expect(mockEventListener.onArrayUnshift).toHaveBeenCalledWith(
      "foo",
      "quux",
    );
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: ["quux", "bar", "baz"],
      },
      defaultValueOverrides: {
        "foo[0]": "quux",
        "foo[1]": "jim",
        foo: ["bar", "baz"],
      },
      touchedFields: {
        "foo[1]": true,
        "foo[2]": true,
      },
      dirtyFields: {
        "foo[1]": true,
        "foo[2]": true,
      },
      validationErrors: {
        "foo[1]": "not equal",
        "foo[2]": "not equal",
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(3);
  });

  it("should unshift into nested arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: [
          { name: "bar", notes: [{ text: "baz" }, { text: "another" }] },
          { name: "value", notes: [{ text: "thing" }] },
        ],
      },
      defaultValueOverrides: {
        "foo[0].notes[0]": { text: "baz" },
        "foo[0].notes[1]": { text: "another" },
      },
      touchedFields: {},
      dirtyFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["a", "b"],
        "foo[0].notes": ["a", "b"],
        "foo[1].notes": ["a"],
      },
    });
    store
      .getState()
      .arrayUnshift("foo", { name: "foo", notes: [{ text: "bar" }] });
    expect(mockEventListener.onArrayUnshift).toHaveBeenCalledWith("foo", {
      name: "foo",
      notes: [{ text: "bar" }],
    });
    let {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: [
          { name: "foo", notes: [{ text: "bar" }] },
          { name: "bar", notes: [{ text: "baz" }, { text: "another" }] },
          { name: "value", notes: [{ text: "thing" }] },
        ],
      },
      defaultValueOverrides: {
        "foo[0]": { name: "foo", notes: [{ text: "bar" }] },
        "foo[1].notes[0]": { text: "baz" },
        "foo[1].notes[1]": { text: "another" },
      },
      dirtyFields: {},
      touchedFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: [expect.any(String), "a", "b"],
        "foo[1].notes": ["a", "b"],
        "foo[2].notes": ["a"],
      },
    });

    store.getState().arrayUnshift("foo[0].notes", { text: "foo" });
    expect(mockEventListener.onArrayUnshift).toHaveBeenCalledWith(
      "foo[0].notes",
      { text: "foo" },
    );
    ({ values, touchedFields, dirtyFields, validationErrors, fieldArrayKeys } =
      store.getState());
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    }).toEqual({
      values: {
        foo: [
          { name: "foo", notes: [{ text: "foo" }, { text: "bar" }] },
          { name: "bar", notes: [{ text: "baz" }, { text: "another" }] },
          { name: "value", notes: [{ text: "thing" }] },
        ],
      },
      dirtyFields: {},
      touchedFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: [expect.any(String), "a", "b"],
        "foo[1].notes": ["a", "b"],
        "foo[2].notes": ["a"],
      },
    });
  });

  it("should insert into arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz"],
      },
      defaultValueOverrides: {
        "foo[0]": "bar",
        "foo[1]": "baz",
      },
      touchedFields: {
        "foo[0]": true,
        "foo[1]": true,
      },
      dirtyFields: {
        "foo[0]": true,
        "foo[1]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
        "foo[1]": "not equal",
      },
      fieldArrayKeys: {
        foo: ["foo[0]", "foo[1]"],
      },
    });
    store.getState().arrayInsert("foo", 1, "quux");
    expect(mockEventListener.onArrayInsert).toHaveBeenCalledWith(
      "foo",
      1,
      "quux",
    );
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: ["bar", "quux", "baz"],
      },
      defaultValueOverrides: {
        "foo[0]": "bar",
        "foo[1]": "quux",
        "foo[2]": "baz",
      },
      touchedFields: {
        "foo[0]": true,
        "foo[2]": true,
      },
      dirtyFields: {
        "foo[0]": true,
        "foo[2]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
        "foo[2]": "not equal",
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(3);
  });

  it("should insert with nested arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: [
          { name: "bar", notes: [{ text: "baz" }, { text: "another" }] },
          { name: "value", notes: [{ text: "thing" }] },
          { name: "foo", notes: [] },
        ],
      },
      defaultValueOverrides: {
        "foo[0].notes[1]": { text: "another" },
        "foo[2]": { name: "jim", notes: [] },
      },
      touchedFields: {},
      dirtyFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["a", "b", "c"],
        "foo[0].notes": ["a", "b"],
        "foo[1].notes": ["a"],
        "foo[2].notes": [],
      },
    });
    store
      .getState()
      .arrayInsert("foo", 1, { name: "hello", notes: [{ text: "goodbye" }] });
    expect(mockEventListener.onArrayInsert).toHaveBeenCalledWith("foo", 1, {
      name: "hello",
      notes: [{ text: "goodbye" }],
    });
    let {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: [
          { name: "bar", notes: [{ text: "baz" }, { text: "another" }] },
          { name: "hello", notes: [{ text: "goodbye" }] },
          { name: "value", notes: [{ text: "thing" }] },
          { name: "foo", notes: [] },
        ],
      },
      defaultValueOverrides: {
        "foo[0].notes[1]": { text: "another" },
        "foo[1]": { name: "hello", notes: [{ text: "goodbye" }] },
        "foo[3]": { name: "jim", notes: [] },
      },
      touchedFields: {},
      dirtyFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["a", expect.any(String), "b", "c"],
        "foo[0].notes": ["a", "b"],
        "foo[2].notes": ["a"],
        "foo[3].notes": [],
      },
    });

    store.getState().arrayInsert("foo[0].notes", 1, { text: "hello" });
    expect(mockEventListener.onArrayInsert).toHaveBeenCalledWith(
      "foo[0].notes",
      1,
      { text: "hello" },
    );
    ({ values, touchedFields, dirtyFields, validationErrors, fieldArrayKeys } =
      store.getState());
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    }).toEqual({
      values: {
        foo: [
          {
            name: "bar",
            notes: [{ text: "baz" }, { text: "hello" }, { text: "another" }],
          },
          { name: "hello", notes: [{ text: "goodbye" }] },
          { name: "value", notes: [{ text: "thing" }] },
          { name: "foo", notes: [] },
        ],
      },
      touchedFields: {},
      dirtyFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["a", expect.any(String), "b", "c"],
        "foo[0].notes": ["a", expect.any(String), "b"],
        "foo[2].notes": ["a"],
        "foo[3].notes": [],
      },
    });
  });

  it("should move items in arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz", "another", "value", "quux"],
      },
      defaultValueOverrides: {
        "foo[0]": "a",
        "foo[1]": "b",
        "foo[2]": "c",
        "foo[3]": "d",
      },
      touchedFields: {
        "foo[0]": true,
        "foo[1]": true,
        "foo[2]": true,
        "foo[3]": false,
      },
      dirtyFields: {
        "foo[0]": false,
        "foo[1]": true,
        "foo[2]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
        "foo[1]": "not equal",
        "foo[4]": "equal",
      },
      fieldArrayKeys: {
        foo: ["foo[0]", "foo[1]", "foo[2]", "foo[3]", "foo[4]"],
      },
    });
    store.getState().arrayMove("foo", 3, 1);
    expect(mockEventListener.onArrayMove).toHaveBeenCalledWith("foo", 3, 1);
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: ["bar", "value", "baz", "another", "quux"],
      },
      defaultValueOverrides: {
        "foo[0]": "a",
        "foo[1]": "d",
        "foo[2]": "b",
        "foo[3]": "c",
      },
      touchedFields: {
        "foo[0]": true,
        "foo[1]": false,
        "foo[2]": true,
        "foo[3]": true,
      },
      dirtyFields: {
        "foo[0]": false,
        "foo[2]": true,
        "foo[3]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
        "foo[2]": "not equal",
        "foo[4]": "equal",
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(5);
  });

  it("should move with nested arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: [
          { name: "bar", notes: [{ text: "baz" }, { text: "another" }] },
          { name: "value", notes: [{ text: "thing" }] },
          { name: "foo", notes: [] },
        ],
      },
      defaultValueOverrides: {
        "foo[0].notes[0]": { text: "baz" },
        "foo[0].notes[1]": { text: "another" },
        "foo[1].notes[0]": { text: "thing" },
        "foo[2]": { name: "foo", notes: [] },
      },
      touchedFields: {},
      dirtyFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["a", "b", "c"],
        "foo[0].notes": ["a", "b"],
        "foo[1].notes": ["a"],
        "foo[2].notes": [],
      },
    });
    store.getState().arrayMove("foo", 0, 2);
    expect(mockEventListener.onArrayMove).toHaveBeenCalledWith("foo", 0, 2);
    let {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: [
          { name: "value", notes: [{ text: "thing" }] },
          { name: "foo", notes: [] },
          { name: "bar", notes: [{ text: "baz" }, { text: "another" }] },
        ],
      },
      defaultValueOverrides: {
        "foo[2].notes[0]": { text: "baz" },
        "foo[2].notes[1]": { text: "another" },
        "foo[0].notes[0]": { text: "thing" },
        "foo[1]": { name: "foo", notes: [] },
      },
      touchedFields: {},
      dirtyFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["b", "c", "a"],
        "foo[0].notes": ["a"],
        "foo[1].notes": [],
        "foo[2].notes": ["a", "b"],
      },
    });

    store.getState().arrayMove("foo[2].notes", 0, 1);
    ({ values, touchedFields, dirtyFields, validationErrors, fieldArrayKeys } =
      store.getState());
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    }).toEqual({
      values: {
        foo: [
          { name: "value", notes: [{ text: "thing" }] },
          { name: "foo", notes: [] },
          { name: "bar", notes: [{ text: "another" }, { text: "baz" }] },
        ],
      },
      touchedFields: {},
      dirtyFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["b", "c", "a"],
        "foo[0].notes": ["a"],
        "foo[1].notes": [],
        "foo[2].notes": ["b", "a"],
      },
    });
  });

  it("should remove items from arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz", "another", "value", "quux"],
      },
      defaultValueOverrides: {
        "foo[0]": "bar",
        "foo[1]": "baz",
        "foo[2]": "another",
      },
      touchedFields: {
        "foo[0]": true,
        "foo[1]": true,
        "foo[2]": true,
        "foo[3]": false,
      },
      dirtyFields: {
        "foo[0]": false,
        "foo[1]": true,
        "foo[2]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
        "foo[1]": "not equal",
        "foo[4]": "equal",
      },
      fieldArrayKeys: {
        foo: ["foo[0]", "foo[1]", "foo[2]", "foo[3]", "foo[4]"],
      },
    });
    store.getState().arrayRemove("foo", 1);
    expect(mockEventListener.onArrayRemove).toHaveBeenCalledWith("foo", 1);
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      defaultValueOverrides,
      fieldArrayKeys,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: ["bar", "another", "value", "quux"],
      },
      defaultValueOverrides: {
        "foo[0]": "bar",
        "foo[1]": "another",
      },
      touchedFields: {
        "foo[0]": true,
        "foo[1]": true,
        "foo[2]": false,
      },
      dirtyFields: {
        "foo[0]": false,
        "foo[1]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
        "foo[3]": "equal",
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(4);
  });

  it("should remove items from arrays with no field array keys", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz", "another", "value", "quux"],
      },
      defaultValueOverrides: {
        "foo[0]": "bar",
        "foo[1]": "baz",
        "foo[2]": "another",
      },
      touchedFields: {
        "foo[0]": true,
        "foo[1]": true,
        "foo[2]": true,
        "foo[3]": false,
      },
      dirtyFields: {
        "foo[0]": false,
        "foo[1]": true,
        "foo[2]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
        "foo[1]": "not equal",
        "foo[4]": "equal",
      },
    });
    store.getState().arrayRemove("foo", 1);
    expect(mockEventListener.onArrayRemove).toHaveBeenCalledWith("foo", 1);
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: ["bar", "another", "value", "quux"],
      },
      defaultValueOverrides: {
        "foo[0]": "bar",
        "foo[1]": "another",
      },
      touchedFields: {
        "foo[0]": true,
        "foo[1]": true,
        "foo[2]": false,
      },
      dirtyFields: {
        "foo[0]": false,
        "foo[1]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
        "foo[3]": "equal",
      },
    });
  });

  it("should remove with nested arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: [
          { name: "bar", notes: [{ text: "baz" }, { text: "another" }] },
          { name: "value", notes: [{ text: "thing" }] },
          { name: "foo", notes: [] },
        ],
      },
      defaultValueOverrides: {
        "foo[0].notes[0]": { text: "baz" },
        "foo[0].notes[1]": { text: "another" },
        "foo[1].notes[0]": { text: "thing" },
        "foo[2]": { name: "foo", notes: [] },
      },
      touchedFields: {},
      dirtyFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["a", "b", "c"],
        "foo[0].notes": ["a", "b"],
        "foo[1].notes": ["a"],
        "foo[2].notes": [],
      },
    });
    store.getState().arrayRemove("foo", 1);
    expect(mockEventListener.onArrayRemove).toHaveBeenCalledWith("foo", 1);
    let {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      arrayUpdateKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
      arrayUpdateKeys,
    }).toEqual({
      values: {
        foo: [
          { name: "bar", notes: [{ text: "baz" }, { text: "another" }] },
          { name: "foo", notes: [] },
        ],
      },
      defaultValueOverrides: {
        "foo[0].notes[0]": { text: "baz" },
        "foo[0].notes[1]": { text: "another" },
        "foo[1]": { name: "foo", notes: [] },
      },
      touchedFields: {},
      dirtyFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["a", "c"],
        "foo[0].notes": ["a", "b"],
        "foo[1].notes": [],
      },
      arrayUpdateKeys: {
        foo: expect.any(String),
      },
    });

    store.getState().arrayRemove("foo[0].notes", 1);
    expect(mockEventListener.onArrayRemove).toHaveBeenCalledWith(
      "foo[0].notes",
      1,
    );
    ({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      arrayUpdateKeys,
    } = store.getState());
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      arrayUpdateKeys,
    }).toEqual({
      values: {
        foo: [
          { name: "bar", notes: [{ text: "baz" }] },
          { name: "foo", notes: [] },
        ],
      },
      touchedFields: {},
      dirtyFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["a", "c"],
        "foo[0].notes": ["a"],
        "foo[1].notes": [],
      },
      arrayUpdateKeys: {
        foo: expect.any(String),
        "foo[0].notes": expect.any(String),
      },
    });
  });

  it("should swap items in arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz", "another", "value", "quux"],
      },
      defaultValueOverrides: {
        "foo[0]": "a",
        "foo[1]": "b",
        "foo[2]": "c",
        "foo[3]": "d",
      },
      touchedFields: {
        "foo[0]": true,
        "foo[1]": true,
        "foo[2]": true,
        "foo[3]": false,
      },
      dirtyFields: {
        "foo[0]": false,
        "foo[1]": true,
        "foo[2]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
        "foo[1]": "not equal",
        "foo[4]": "equal",
      },
      fieldArrayKeys: {
        foo: ["foo[0]", "foo[1]", "foo[2]", "foo[3]", "foo[4]"],
      },
    });
    store.getState().arraySwap("foo", 1, 3);
    expect(mockEventListener.onArraySwap).toHaveBeenCalledWith("foo", 1, 3);
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      arrayUpdateKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      arrayUpdateKeys,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: ["bar", "value", "another", "baz", "quux"],
      },
      defaultValueOverrides: {
        "foo[0]": "a",
        "foo[1]": "d",
        "foo[2]": "c",
        "foo[3]": "b",
      },
      touchedFields: {
        "foo[0]": true,
        "foo[1]": false,
        "foo[2]": true,
        "foo[3]": true,
      },
      dirtyFields: {
        "foo[0]": false,
        "foo[2]": true,
        "foo[3]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
        "foo[3]": "not equal",
        "foo[4]": "equal",
      },
      arrayUpdateKeys: {
        foo: expect.any(String),
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(5);
  });

  it("should swap items in arrays no field array keys", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz", "another", "value", "quux"],
      },
      defaultValueOverrides: {
        "foo[0]": "a",
        "foo[1]": "b",
        "foo[2]": "c",
        "foo[3]": "d",
      },
      touchedFields: {
        "foo[0]": true,
        "foo[1]": true,
        "foo[2]": true,
        "foo[3]": false,
      },
      dirtyFields: {
        "foo[0]": false,
        "foo[1]": true,
        "foo[2]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
        "foo[1]": "not equal",
        "foo[4]": "equal",
      },
    });
    store.getState().arraySwap("foo", 1, 3);
    expect(mockEventListener.onArraySwap).toHaveBeenCalledWith("foo", 1, 3);
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      arrayUpdateKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      arrayUpdateKeys,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: ["bar", "value", "another", "baz", "quux"],
      },
      defaultValueOverrides: {
        "foo[0]": "a",
        "foo[1]": "d",
        "foo[2]": "c",
        "foo[3]": "b",
      },
      touchedFields: {
        "foo[0]": true,
        "foo[1]": false,
        "foo[2]": true,
        "foo[3]": true,
      },
      dirtyFields: {
        "foo[0]": false,
        "foo[2]": true,
        "foo[3]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
        "foo[3]": "not equal",
        "foo[4]": "equal",
      },
      arrayUpdateKeys: {
        foo: expect.any(String),
      },
    });
  });

  it("should not do anything if swapping two non-existant items", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: [],
      },
      touchedFields: {},
      dirtyFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: [],
      },
    });
    store.getState().arraySwap("foo", 1, 3);
    expect(mockEventListener.onArraySwap).toHaveBeenCalledWith("foo", 1, 3);
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    }).toEqual({
      values: {
        foo: [],
      },
      touchedFields: {},
      dirtyFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: [],
      },
    });
  });

  it("should swap with nested arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: [
          { name: "bar", notes: [{ text: "baz" }, { text: "another" }] },
          { name: "value", notes: [{ text: "thing" }] },
          { name: "foo", notes: [] },
        ],
      },
      touchedFields: {},
      dirtyFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["a", "b", "c"],
        "foo[0].notes": ["a", "b"],
        "foo[1].notes": ["a"],
        "foo[2].notes": [],
      },
    });
    store.getState().arraySwap("foo", 0, 2);
    expect(mockEventListener.onArraySwap).toHaveBeenCalledWith("foo", 0, 2);
    let {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    }).toEqual({
      values: {
        foo: [
          { name: "foo", notes: [] },
          { name: "value", notes: [{ text: "thing" }] },
          { name: "bar", notes: [{ text: "baz" }, { text: "another" }] },
        ],
      },
      dirtyFields: {},
      touchedFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["c", "b", "a"],
        "foo[0].notes": [],
        "foo[1].notes": ["a"],
        "foo[2].notes": ["a", "b"],
      },
    });

    store.getState().arraySwap("foo[2].notes", 0, 1);
    expect(mockEventListener.onArraySwap).toHaveBeenCalledWith(
      "foo[2].notes",
      0,
      1,
    );
    ({ values, touchedFields, dirtyFields, validationErrors, fieldArrayKeys } =
      store.getState());
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    }).toEqual({
      values: {
        foo: [
          { name: "foo", notes: [] },
          { name: "value", notes: [{ text: "thing" }] },
          { name: "bar", notes: [{ text: "another" }, { text: "baz" }] },
        ],
      },
      dirtyFields: {},
      touchedFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["c", "b", "a"],
        "foo[0].notes": [],
        "foo[1].notes": ["a"],
        "foo[2].notes": ["b", "a"],
      },
    });
  });

  it("should replace items in arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz", "another", "value", "quux"],
      },
      defaultValueOverrides: {
        "foo[0]": "a",
        "foo[1]": "b",
        "foo[2]": "c",
        "foo[3]": "d",
      },
      touchedFields: {
        "foo[0]": true,
        "foo[1]": true,
        "foo[2]": true,
        "foo[3]": false,
      },
      dirtyFields: {
        "foo[0]": false,
        "foo[1]": true,
        "foo[2]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
        "foo[1]": "not equal",
        "foo[4]": "equal",
      },
      fieldArrayKeys: {
        foo: ["foo[0]", "foo[1]", "foo[2]", "foo[3]", "foo[4]"],
      },
    });
    store.getState().arrayReplace("foo", 1, "quux");
    expect(mockEventListener.onArrayReplace).toHaveBeenCalledWith(
      "foo",
      1,
      "quux",
    );
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: ["bar", "quux", "another", "value", "quux"],
      },
      defaultValueOverrides: {
        "foo[0]": "a",
        "foo[1]": "quux",
        "foo[2]": "c",
        "foo[3]": "d",
      },
      touchedFields: {
        "foo[0]": true,
        "foo[2]": true,
        "foo[3]": false,
      },
      dirtyFields: {
        "foo[0]": false,
        "foo[2]": true,
      },
      validationErrors: {
        "foo[0]": "not equal",
        "foo[4]": "equal",
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(5);
    expect(fieldArrayKeys.foo[1]).not.toBe("foo[1]");
  });

  it("should replace with nested arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: [
          { name: "bar", notes: [{ text: "baz" }, { text: "another" }] },
          { name: "value", notes: [{ text: "thing" }] },
        ],
      },
      defaultValueOverrides: {
        "foo[0].notes[0]": { text: "baz" },
        "foo[0].notes[1]": { text: "another" },
        "foo[1].notes[0]": { text: "thing" },
      },
      touchedFields: {},
      dirtyFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: ["a", "b"],
        "foo[0].notes": ["a", "b"],
        "foo[1].notes": ["a"],
      },
    });
    store
      .getState()
      .arrayReplace("foo", 0, { name: "foo", notes: [{ text: "bar" }] });
    expect(mockEventListener.onArrayReplace).toHaveBeenCalledWith("foo", 0, {
      name: "foo",
      notes: [{ text: "bar" }],
    });
    let {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      arrayUpdateKeys,
      defaultValueOverrides,
    } = store.getState();
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
      arrayUpdateKeys,
      defaultValueOverrides,
    }).toEqual({
      values: {
        foo: [
          { name: "foo", notes: [{ text: "bar" }] },
          { name: "value", notes: [{ text: "thing" }] },
        ],
      },
      defaultValueOverrides: {
        "foo[0]": { name: "foo", notes: [{ text: "bar" }] },
        "foo[1].notes[0]": { text: "thing" },
      },
      dirtyFields: {},
      touchedFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: [expect.any(String), "b"],
        "foo[1].notes": ["a"],
      },
      arrayUpdateKeys: {
        foo: expect.any(String),
      },
    });

    store.getState().arrayReplace("foo[1].notes", 0, { text: "jim" });
    ({ values, touchedFields, dirtyFields, validationErrors, fieldArrayKeys } =
      store.getState());
    expect({
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    }).toEqual({
      values: {
        foo: [
          { name: "foo", notes: [{ text: "bar" }] },
          { name: "value", notes: [{ text: "jim" }] },
        ],
      },
      dirtyFields: {},
      touchedFields: {},
      validationErrors: {},
      fieldArrayKeys: {
        foo: [expect.any(String), "b"],
        "foo[1].notes": [expect.any(String)],
      },
    });
  });

  it("should setValue on nested array objects", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: [{ name: "" }],
      },
      touchedFields: {},
      dirtyFields: {},
      validationErrors: {},
      fieldArrayKeys: {},
    });

    store.getState().setValue("foo[0].name", "b");
    expect(mockEventListener.onFieldSetValue).toHaveBeenCalledWith(
      "foo[0].name",
      "b",
    );
    expect(store.getState().values).toEqual({
      foo: [{ name: "b" }],
    });
  });
});

it("should be able to `resetField` on a whole array", () => {
  const store = testStore();
  store.setState({
    defaultValues: {
      foo: [{ name: "baz", notes: [{ text: "jimbo" }] }],
    },
    defaultValueOverrides: {
      "foo[0].notes[0]": { text: "baz" },
    },
    values: {
      foo: [
        { name: "foo", notes: [{ text: "bar" }] },
        { name: "value", notes: [{ text: "thing" }] },
      ],
    },
    touchedFields: {},
    dirtyFields: {},
    validationErrors: {},
    fieldArrayKeys: {},
  });

  store.getState().resetField("foo");
  expect(mockEventListener.onFieldReset).toHaveBeenCalledWith("foo", [
    { name: "baz", notes: [{ text: "jimbo" }] },
  ]);

  const { values, defaultValueOverrides } = store.getState();
  expect({ values, defaultValueOverrides }).toEqual({
    values: {
      foo: [{ name: "baz", notes: [{ text: "jimbo" }] }],
    },
    defaultValueOverrides: {},
  });
});

it("should override resetField overrides with reset or parent resetFields", () => {
  const store = testStore({
    defaultValues: {
      foo: { bar: "bar" },
    },
  });
  expect(getFieldDefaultValue(store.getState(), "foo.bar")).toBe("bar");
  expect(getFieldDefaultValue(store.getState(), "foo")).toEqual({ bar: "bar" });

  store.getState().resetField("foo.bar", { defaultValue: "baz" });
  expect(mockEventListener.onFieldReset).toHaveBeenCalledWith("foo.bar", "baz");
  expect(getFieldDefaultValue(store.getState(), "foo.bar")).toBe("baz");
  expect(getFieldDefaultValue(store.getState(), "foo")).toEqual({ bar: "bar" });

  store.getState().resetField("foo");
  expect(mockEventListener.onFieldReset).toHaveBeenCalledWith("foo", {
    bar: "bar",
  });
  expect(getFieldDefaultValue(store.getState(), "foo.bar")).toBe("bar");
  expect(getFieldDefaultValue(store.getState(), "foo")).toEqual({ bar: "bar" });

  store.getState().resetField("foo.bar", { defaultValue: "baz" });
  expect(mockEventListener.onFieldReset).toHaveBeenCalledWith("foo.bar", "baz");
  expect(getFieldDefaultValue(store.getState(), "foo.bar")).toBe("baz");
  expect(getFieldDefaultValue(store.getState(), "foo")).toEqual({ bar: "bar" });

  store.getState().reset();
  expect(mockEventListener.onFormReset).toHaveBeenCalledWith({
    foo: { bar: "bar" },
  });
  expect(getFieldDefaultValue(store.getState(), "foo.bar")).toBe("bar");
  expect(getFieldDefaultValue(store.getState(), "foo")).toEqual({ bar: "bar" });
});

it("should keep errors if keepError is provided", () => {
  const store = testStore({
    defaultValues: {
      foo: { bar: "bar" },
    },
  });
  store.setState({
    validationErrors: {
      foo: "error",
    },
    customValidationErrors: {
      foo: "bar",
    },
  });

  store.getState().resetField("foo", {
    keepError: true,
  });
  expect(mockEventListener.onFieldReset).toHaveBeenCalledWith("foo", {
    bar: "bar",
  });
  expect(store.getState()).toMatchObject({
    validationErrors: { foo: "error" },
    customValidationErrors: { foo: "bar" },
  });
});

it("should be able to override the default value with an explicit null or undefined", () => {
  const store = testStore({
    defaultValues: { foo: { bar: "bar" } },
  });
  expect(getFieldDefaultValue(store.getState(), "foo.bar")).toBe("bar");
  expect(getFieldDefaultValue(store.getState(), "foo")).toEqual({ bar: "bar" });
  expect(getFieldValue(store.getState(), "foo.bar")).toBe("bar");
  expect(getFieldValue(store.getState(), "foo")).toEqual({ bar: "bar" });

  store.getState().resetField("foo", { defaultValue: null });
  expect(getFieldDefaultValue(store.getState(), "foo.bar")).toBe(undefined);
  expect(getFieldDefaultValue(store.getState(), "foo")).toBe(null);
  expect(getFieldValue(store.getState(), "foo.bar")).toBe(undefined);
  expect(getFieldValue(store.getState(), "foo")).toEqual(null);

  store.getState().resetField("foo", { defaultValue: undefined });
  expect(getFieldDefaultValue(store.getState(), "foo.bar")).toBe(undefined);
  expect(getFieldDefaultValue(store.getState(), "foo")).toBe(undefined);
  expect(getFieldValue(store.getState(), "foo.bar")).toBe(undefined);
  expect(getFieldValue(store.getState(), "foo")).toEqual(undefined);
});

it("should return the default value from a parent override", () => {
  const store = testStore({
    defaultValues: {
      foo: { bar: "bar" },
    },
  });
  expect(getFieldDefaultValue(store.getState(), "foo.bar")).toBe("bar");
  expect(getFieldDefaultValue(store.getState(), "foo")).toEqual({ bar: "bar" });

  store.getState().resetField("foo", { defaultValue: { bar: "baz" } });
  expect(getFieldDefaultValue(store.getState(), "foo.bar")).toBe("baz");
  expect(getFieldDefaultValue(store.getState(), "foo")).toEqual({ bar: "baz" });

  store.getState().reset();
  expect(getFieldDefaultValue(store.getState(), "foo.bar")).toBe("bar");
  expect(getFieldDefaultValue(store.getState(), "foo")).toEqual({ bar: "bar" });
});

describe("resolver queue", () => {
  it("should resolve", async () => {
    const queue = createResolverQueue();

    await expect(queue.await()).resolves.toBeUndefined();

    const prom1 = queue.queue();
    const prom2 = queue.queue();
    const prom3 = queue.await();

    queue.flush();

    await expect(prom1).resolves.toBeUndefined();
    await expect(prom2).resolves.toBeUndefined();
    await expect(prom3).resolves.toBeUndefined();
  });
});

describe("custom errors", () => {
  it("should return custom errors before regular errors", async () => {
    const onSubmit = vi.fn();
    const store = testStore({
      defaultValues: {
        firstName: "Jane",
      },
      validationBehaviorConfig: {
        whenSubmitted: "onChange",
        initial: "onChange",
        whenTouched: "onChange",
      },
      mutableImplStore: {
        onSubmitFailure: vi.fn(),
        onSubmitSuccess: vi.fn(),
        onBeforeSubmit: vi.fn(),
        onInvalidSubmit: vi.fn(),
        validator: createValidator({
          validate: (data) => {
            if (data.firstName === "Jane")
              return Promise.resolve({
                error: { firstName: "Invalid" },
                data: undefined,
              });
            return Promise.resolve({
              data: { transformed: "data" },
              error: undefined,
            });
          },
        }),
        onSubmit,
      },
    });

    await store.getState().validate();
    expect(getFieldError(store.getState(), "firstName")).toEqual("Invalid");
    expect(getAllErrors(store.getState())).toEqual({ firstName: "Invalid" });

    store.getState().setCustomError("firstName", "Custom error");
    expect(getFieldError(store.getState(), "firstName")).toEqual(
      "Custom error",
    );
    expect(getAllErrors(store.getState())).toEqual({
      firstName: "Custom error",
    });

    store.getState().setCustomError("firstName", null);
    expect(getFieldError(store.getState(), "firstName")).toEqual("Invalid");
    expect(getAllErrors(store.getState())).toEqual({ firstName: "Invalid" });
  });

  it("should fail submission when custom errors are the only errors", async () => {
    const onBeforeSubmit = vi.fn();
    const onInvalidSubmit = vi.fn();
    const onSubmit = vi.fn();
    const store = testStore({
      defaultValues: {
        firstName: "Jane",
      },
      mutableImplStore: {
        onSubmit,
        onSubmitFailure: vi.fn(),
        onSubmitSuccess: vi.fn(),
        onBeforeSubmit,
        onInvalidSubmit,
        validator: createValidator({
          validate: (data) => Promise.resolve({ data, error: undefined }),
        }),
      },
    });

    store.getState().setCustomError("firstName", "Custom error");
    store.getState().onSubmit();

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(onSubmit).not.toBeCalled();
    expect(onBeforeSubmit).toBeCalled();
    expect(onInvalidSubmit).toBeCalled();
  });

  it("should submit successfully if the error is cleared in onBeforeSubmit", async () => {
    const onInvalidSubmit = vi.fn();
    const onSubmit = vi.fn();
    const store = testStore({
      defaultValues: {
        firstName: "Jane",
      },
      mutableImplStore: {
        onSubmit,
        onSubmitFailure: vi.fn(),
        onSubmitSuccess: vi.fn(),
        onBeforeSubmit: () => {
          store.getState().setCustomError("firstName", null);
        },
        onInvalidSubmit,
        validator: createValidator({
          validate: (data) => Promise.resolve({ data, error: undefined }),
        }),
      },
    });

    store.getState().setCustomError("firstName", "Custom error");
    store.getState().onSubmit();

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(onSubmit).toBeCalled();
    expect(onInvalidSubmit).not.toBeCalled();
  });

  it("should submit successfully if onBeforeSubmit explicitly submits", async () => {
    const onInvalidSubmit = vi.fn();
    const onSubmit = vi.fn();
    const store = testStore({
      defaultValues: {
        firstName: "Jane",
      },
      mutableImplStore: {
        onSubmit,
        onSubmitFailure: vi.fn(),
        onSubmitSuccess: vi.fn(),
        onBeforeSubmit: (api) => {
          void api.performSubmit({
            firstName: "Yo",
          });
        },
        onInvalidSubmit,
        validator: createValidator({
          validate: (data) => Promise.resolve({ data, error: undefined }),
        }),
      },
    });

    store.getState().setCustomError("firstName", "Custom error");
    store.getState().onSubmit();

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(onSubmit).toBeCalled();
    expect(onInvalidSubmit).not.toBeCalled();
  });
});
