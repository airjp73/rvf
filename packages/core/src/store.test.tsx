import { describe, expect, it } from "vitest";
import { createFormStateStore, createRefStore } from "./store";

const testStore = () =>
  createFormStateStore({
    initialValues: {},
    controlledFieldRefs: createRefStore(),
    transientFieldRefs: createRefStore(),
    mutableImplStore: {
      validator: () => ({ type: "success", data: null }),
      onSubmit: () => Promise.resolve(),
    },
  });

describe("createFormStateStore", () => {
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
