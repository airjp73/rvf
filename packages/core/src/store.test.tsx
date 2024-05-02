import { describe, expect, it, vi } from "vitest";
import { FormStoreInit, createFormStateStore, createRefStore } from "./store";
import { ValidationBehavior } from "./types";

const testStore = (init?: Partial<FormStoreInit>) =>
  createFormStateStore({
    defaultValues: {},
    controlledFieldRefs: createRefStore(),
    transientFieldRefs: createRefStore(),
    mutableImplStore: {
      validator: () => Promise.resolve({ data: null, error: undefined }),
      onSubmit: () => Promise.resolve(),
    },
    ...init,
  });

describe("validation", () => {
  it("should validate using the provided validator at the right time", async () => {
    const onSubmit = vi.fn();
    const store = testStore({
      mutableImplStore: {
        validator: (data) => {
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
        onSubmit,
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

    store.getState().onSubmit();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(store.getState().validationErrors).toEqual({});
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ transformed: "data" });
  });

  it("should be possible to set the validation behavior on demand for a given event", async () => {
    const onSubmit = vi.fn();
    const store = testStore({
      mutableImplStore: {
        validator: (data) => {
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
        onSubmit,
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

    store.getState().onFieldChange("firstName", "Jane", behavior("onChange"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(store.getState().validationErrors).toEqual({
      firstName: "Invalid",
    });

    store.getState().onFieldChange("firstName", "John", behavior("onBlur"));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(store.getState().validationErrors).toEqual({
      firstName: "Invalid",
    });

    store.getState().onFieldBlur("firstName", behavior("onBlur"));
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
        "foo.0": true,
      },
      dirtyFields: {
        "foo.0": true,
      },
      validationErrors: {
        "foo.1": "not equal",
      },
      fieldArrayKeys: {
        foo: ["foo.0", "foo.1"],
      },
    });
    store.getState().arrayPush("foo", "quux");
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    } = store.getState();
    expect({ values, touchedFields, dirtyFields, validationErrors }).toEqual({
      values: {
        foo: ["bar", "baz", "quux"],
      },
      touchedFields: {
        "foo.0": true,
      },
      dirtyFields: {
        "foo.0": true,
      },
      validationErrors: {
        "foo.1": "not equal",
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(3);
  });

  it("should pop from arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz"],
      },
      touchedFields: {
        "foo.0": true,
        "foo.1": true,
      },
      dirtyFields: {
        "foo.0": true,
        "foo.1": true,
      },
      validationErrors: {
        "foo.0": "not equal",
        "foo.1": "not equal",
      },
      fieldArrayKeys: {
        foo: ["foo.0", "foo.1"],
      },
    });
    store.getState().arrayPop("foo");
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    } = store.getState();
    expect({ values, touchedFields, dirtyFields, validationErrors }).toEqual({
      values: {
        foo: ["bar"],
      },
      touchedFields: {
        "foo.0": true,
      },
      dirtyFields: {
        "foo.0": true,
      },
      validationErrors: {
        "foo.0": "not equal",
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(1);
  });

  it("should shift from arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz"],
      },
      touchedFields: {
        "foo.0": false,
        "foo.1": true,
      },
      dirtyFields: {
        "foo.0": false,
        "foo.1": true,
      },
      validationErrors: {
        "foo.0": "equal",
        "foo.1": "not equal",
      },
      fieldArrayKeys: {
        foo: ["foo.0", "foo.1"],
      },
    });
    store.getState().arrayShift("foo");
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    } = store.getState();
    expect({ values, touchedFields, dirtyFields, validationErrors }).toEqual({
      values: {
        foo: ["baz"],
      },
      touchedFields: {
        "foo.0": true,
      },
      dirtyFields: {
        "foo.0": true,
      },
      validationErrors: {
        "foo.0": "not equal",
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(1);
  });

  it("should unshift to arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz"],
      },
      touchedFields: {
        "foo.0": true,
        "foo.1": true,
      },
      dirtyFields: {
        "foo.0": true,
        "foo.1": true,
      },
      validationErrors: {
        "foo.0": "not equal",
        "foo.1": "not equal",
      },
      fieldArrayKeys: {
        foo: ["foo.0", "foo.1"],
      },
    });
    store.getState().arrayUnshift("foo", "quux");
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    } = store.getState();
    expect({ values, touchedFields, dirtyFields, validationErrors }).toEqual({
      values: {
        foo: ["quux", "bar", "baz"],
      },
      touchedFields: {
        "foo.1": true,
        "foo.2": true,
      },
      dirtyFields: {
        "foo.1": true,
        "foo.2": true,
      },
      validationErrors: {
        "foo.1": "not equal",
        "foo.2": "not equal",
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(3);
  });

  it("should insert into arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz"],
      },
      touchedFields: {
        "foo.0": true,
        "foo.1": true,
      },
      dirtyFields: {
        "foo.0": true,
        "foo.1": true,
      },
      validationErrors: {
        "foo.0": "not equal",
        "foo.1": "not equal",
      },
      fieldArrayKeys: {
        foo: ["foo.0", "foo.1"],
      },
    });
    store.getState().arrayInsert("foo", 1, "quux");
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    } = store.getState();
    expect({ values, touchedFields, dirtyFields, validationErrors }).toEqual({
      values: {
        foo: ["bar", "quux", "baz"],
      },
      touchedFields: {
        "foo.0": true,
        "foo.2": true,
      },
      dirtyFields: {
        "foo.0": true,
        "foo.2": true,
      },
      validationErrors: {
        "foo.0": "not equal",
        "foo.2": "not equal",
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(3);
  });

  it("should move items in arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz", "another", "value", "quux"],
      },
      touchedFields: {
        "foo.0": true,
        "foo.1": true,
        "foo.2": true,
        "foo.3": false,
      },
      dirtyFields: {
        "foo.0": false,
        "foo.1": true,
        "foo.2": true,
      },
      validationErrors: {
        "foo.0": "not equal",
        "foo.1": "not equal",
        "foo.4": "equal",
      },
      fieldArrayKeys: {
        foo: ["foo.0", "foo.1", "foo.2", "foo.3", "foo.4"],
      },
    });
    store.getState().arrayMove("foo", 3, 1);
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    } = store.getState();
    expect({ values, touchedFields, dirtyFields, validationErrors }).toEqual({
      values: {
        foo: ["bar", "value", "baz", "another", "quux"],
      },
      touchedFields: {
        "foo.0": true,
        "foo.1": false,
        "foo.2": true,
        "foo.3": true,
      },
      dirtyFields: {
        "foo.0": false,
        "foo.2": true,
        "foo.3": true,
      },
      validationErrors: {
        "foo.0": "not equal",
        "foo.2": "not equal",
        "foo.4": "equal",
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(5);
  });

  it("should remove items from arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz", "another", "value", "quux"],
      },
      touchedFields: {
        "foo.0": true,
        "foo.1": true,
        "foo.2": true,
        "foo.3": false,
      },
      dirtyFields: {
        "foo.0": false,
        "foo.1": true,
        "foo.2": true,
      },
      validationErrors: {
        "foo.0": "not equal",
        "foo.1": "not equal",
        "foo.4": "equal",
      },
      fieldArrayKeys: {
        foo: ["foo.0", "foo.1", "foo.2", "foo.3", "foo.4"],
      },
    });
    store.getState().arrayRemove("foo", 1);
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    } = store.getState();
    expect({ values, touchedFields, dirtyFields, validationErrors }).toEqual({
      values: {
        foo: ["bar", "another", "value", "quux"],
      },
      touchedFields: {
        "foo.0": true,
        "foo.1": true,
        "foo.2": false,
      },
      dirtyFields: {
        "foo.0": false,
        "foo.1": true,
      },
      validationErrors: {
        "foo.0": "not equal",
        "foo.3": "equal",
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(4);
  });

  it("should swap items in arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz", "another", "value", "quux"],
      },
      touchedFields: {
        "foo.0": true,
        "foo.1": true,
        "foo.2": true,
        "foo.3": false,
      },
      dirtyFields: {
        "foo.0": false,
        "foo.1": true,
        "foo.2": true,
      },
      validationErrors: {
        "foo.0": "not equal",
        "foo.1": "not equal",
        "foo.4": "equal",
      },
      fieldArrayKeys: {
        foo: ["foo.0", "foo.1", "foo.2", "foo.3", "foo.4"],
      },
    });
    store.getState().arraySwap("foo", 1, 3);
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    } = store.getState();
    expect({ values, touchedFields, dirtyFields, validationErrors }).toEqual({
      values: {
        foo: ["bar", "value", "another", "baz", "quux"],
      },
      touchedFields: {
        "foo.0": true,
        "foo.1": false,
        "foo.2": true,
        "foo.3": true,
      },
      dirtyFields: {
        "foo.0": false,
        "foo.2": true,
        "foo.3": true,
      },
      validationErrors: {
        "foo.0": "not equal",
        "foo.3": "not equal",
        "foo.4": "equal",
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(5);
  });

  it("should replace items in arrays", () => {
    const store = testStore();
    store.setState({
      values: {
        foo: ["bar", "baz", "another", "value", "quux"],
      },
      touchedFields: {
        "foo.0": true,
        "foo.1": true,
        "foo.2": true,
        "foo.3": false,
      },
      dirtyFields: {
        "foo.0": false,
        "foo.1": true,
        "foo.2": true,
      },
      validationErrors: {
        "foo.0": "not equal",
        "foo.1": "not equal",
        "foo.4": "equal",
      },
      fieldArrayKeys: {
        foo: ["foo.0", "foo.1", "foo.2", "foo.3", "foo.4"],
      },
    });
    store.getState().arrayReplace("foo", 1, "quux");
    const {
      values,
      touchedFields,
      dirtyFields,
      validationErrors,
      fieldArrayKeys,
    } = store.getState();
    expect({ values, touchedFields, dirtyFields, validationErrors }).toEqual({
      values: {
        foo: ["bar", "quux", "another", "value", "quux"],
      },
      touchedFields: {
        "foo.0": true,
        "foo.2": true,
        "foo.3": false,
      },
      dirtyFields: {
        "foo.0": false,
        "foo.2": true,
      },
      validationErrors: {
        "foo.0": "not equal",
        "foo.4": "equal",
      },
    });
    expect(fieldArrayKeys.foo).toHaveLength(5);
    expect(fieldArrayKeys.foo[1]).not.toBe("foo.1");
  });
});
