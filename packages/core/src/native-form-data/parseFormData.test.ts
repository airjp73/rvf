import { parseFormData } from "./parseFormData";
import { z } from "zod";

test("should parse a form data object", async () => {
  const data = new FormData();
  data.set("foo", "bar");
  data.set("baz", "quux");

  const schema = z.object({ foo: z.string(), baz: z.string() });
  const result = await parseFormData(data, schema);

  expect(result).toEqual({
    data: { foo: "bar", baz: "quux" },
    submittedData: { foo: "bar", baz: "quux" },
  });
});

test("should parse a request that has form data", async () => {
  const data = new FormData();
  data.set("foo", "bar");
  data.set("baz", "quux");

  const req = { formData: () => Promise.resolve(data) };

  const schema = z.object({ foo: z.string(), baz: z.string() });
  const result = await parseFormData(req, schema);

  expect(result).toEqual({
    data: { foo: "bar", baz: "quux" },
    submittedData: { foo: "bar", baz: "quux" },
  });
});

test("should return errors", async () => {
  const data = new FormData();
  data.set("foo", "bar");

  const schema = z.object({ foo: z.string(), baz: z.string() });
  const result = await parseFormData(data, schema);

  expect(result).toEqual({
    error: {
      fieldErrors: { baz: "Required" },
    },
    submittedData: { foo: "bar" },
  });
});
