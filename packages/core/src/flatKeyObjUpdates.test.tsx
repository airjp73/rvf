import { deleteFieldsWithPrefix, moveFieldArrayKeys } from "./store";

describe("moveFieldArrayKeys", () => {
  it("should move field array keys", () => {
    const state = {
      "a.0": true,
      "a.0.foo": false,
      "a.1": true,
      "a.2.bar": false,
      "b.0": true,
    };
    const state2 = {
      "a.0": "foo",
      "a.0.foo": "bar",
      "a.1": "foo",
      "a.2.bar": "bar",
      "b.0": "foo",
    };
    moveFieldArrayKeys([state, state2], "a", (index) => index + 1);
    expect(state).toEqual({
      "a.1": true,
      "a.1.foo": false,
      "a.2": true,
      "a.3.bar": false,
      "b.0": true,
    });
    expect(state2).toEqual({
      "a.1": "foo",
      "a.1.foo": "bar",
      "a.2": "foo",
      "a.3.bar": "bar",
      "b.0": "foo",
    });
  });
});

describe("deleteFieldsWithPrefix", () => {
  it("should delete fields with a prefix", () => {
    const state = {
      "a.0": true,
      "a.0.foo": false,
      "a.1": true,
      "a.2.bar": false,
    };
    deleteFieldsWithPrefix([state], "a.0");
    expect(state).toEqual({
      "a.1": true,
      "a.2.bar": false,
    });
  });
});
