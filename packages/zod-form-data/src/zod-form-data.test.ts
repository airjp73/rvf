import { TestFormData } from "@remix-validated-form/test-utils";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { z, ZodError } from "zod";
import { zfd } from "./";

const expectError = (schema: z.Schema<any>, val: any, error?: ZodError) => {
  expect(schema.safeParse(val)).toMatchObject({
    error: error ? error : expect.any(z.ZodError),
    success: false,
  });
};

const expectValid = (schema: z.Schema<any>, val: any) => {
  expect(schema.safeParse(val)).toEqual({
    success: true,
    data: val,
  });
};

describe("zod helpers", () => {
  describe("text", () => {
    it("should interperet an empty string as undefined", () => {
      const s = zfd.text(z.string().optional());
      expect(s.parse("")).toBeUndefined();
    });

    it("should fail a required check with an empty string", () => {
      const s = zfd.text();
      expectError(s, "");
    });

    it("should return the value if a non-empty string", () => {
      const s = zfd.text();
      expect(s.parse("Something valid")).toBe("Something valid");
    });

    it("should not touch non-strings", () => {
      const s = zfd.text(z.number());
      expect(s.parse(123)).toBe(123);
    });

    it("should error on anything else that would normally error", () => {
      const s = zfd.text();
      expectError(s, 123);
    });

    it("should respect validations from provided schema", () => {
      const s = zfd.text(z.string().email());
      expectError(s, "hi!");
      expectValid(s, "testing@example.com");
    });
  });

  describe("numeric", () => {
    it("should interperet an empty string as undefined", () => {
      const s = zfd.numeric(z.number().optional());
      expect(s.parse("")).toBeUndefined();
    });

    it("should fail a required check with an empty string", () => {
      const s = zfd.numeric();
      expectError(s, "");
    });

    it("should coerce valid values into numbers", () => {
      const s = zfd.numeric();
      expect(s.parse("123")).toBe(123);
    });

    it("should not touch invalid numbers", () => {
      const s = zfd.numeric(z.string());
      expect(s.parse("asdf")).toBe("asdf");
    });

    it("should error on things that would normally error", () => {
      const s = zfd.numeric();
      expectError(s, "asdf");
    });

    it("should respect validations from provided schema", () => {
      const s = zfd.text(z.number().min(13));
      expectError(s, 12);
      expectValid(s, 13);
    });
  });

  describe("checkbox", () => {
    it("should interperet 'on' as true", () => {
      const s = zfd.checkbox();
      expect(s.parse("on")).toBe(true);
    });

    it("should interperet 'undefined' as false", () => {
      const s = zfd.checkbox();
      expect(s.parse(undefined)).toBe(false);
    });

    it("should fail on other strings", () => {
      const s = zfd.checkbox();
      expectError(s, "asdf");
    });

    it("should support custom true values", () => {
      const s = zfd.checkbox({ trueValue: "asdf" });
      expect(s.parse("asdf")).toBe(true);
    });

    it("should fail anything else", () => {
      const s = zfd.checkbox();
      expectError(s, 123);
    });
  });

  describe("repeatable", () => {
    it("should transform single values to arrays", () => {
      const s = zfd.repeatable();
      expect(s.parse("asdf")).toEqual(["asdf"]);
    });

    it("should leave arrays as arrays", () => {
      const s = zfd.repeatable();
      expect(s.parse(["asdf"])).toEqual(["asdf"]);
    });

    it("should respect provided validation", () => {
      const s = zfd.repeatable(z.array(zfd.numeric(z.number().min(13))));
      expectError(s, "12");
      expect(s.parse("13")).toEqual([13]);
    });

    it("should result in an empty array if no value is present", () => {
      const s = zfd.repeatable(z.any());
      expect(s.parse(undefined)).toEqual([]);
    });

    it("should result in an empty array if no value is present in FormData", () => {
      const s = zfd.formData({
        myRepeatable: zfd.repeatable(z.any()),
      });
      expect(s.parse(new TestFormData())).toEqual({ myRepeatable: [] });
    });

    it("should handle empty strings", () => {
      const s = zfd.repeatable();
      expectError(s, ["", ""]);

      const s2 = zfd.repeatable(z.array(zfd.text(z.string().optional())));
      expect(s2.parse(["", ""])).toEqual([undefined, undefined]);
    });

    it("should handle arrays of Files", () => {
      const s = zfd.formData({
        myRepeatable: zfd.repeatable(z.any()),
      });
      const fd = new FormData();
      const f1 = new File(["test"], "test.txt", { type: "text/plain" });
      const f2 = new File(["test2"], "test2.txt", { type: "text/plain" });
      fd.append("myRepeatable", f1);
      fd.append("myRepeatable", f2);
      const res = s.parse(fd);
      expect(res).toEqual({ myRepeatable: [f1, f2] });
      expect(res.myRepeatable[0]?.name).toEqual("test.txt");
    });
  });

  describe("repeatableOfType", () => {
    it("should accept schema for item type", () => {
      const s = zfd.repeatableOfType(zfd.numeric(z.number().min(13)));
      expectError(s, "12");
      expect(s.parse("13")).toEqual([13]);
    });
    it("should fail on multiple items with correct error", () => {
      const s = zfd.repeatableOfType(zfd.numeric(z.number().positive()));
      expectError(
        s,
        ["adsf", -123],
        new ZodError([
          {
            code: "invalid_type",
            expected: "number",
            received: "string",
            path: [0],
            message: "Expected number, received string",
          },
          {
            code: "too_small",
            minimum: 0,
            type: "number",
            inclusive: false,
            exact: false,
            message: "Number must be greater than 0",
            path: [1],
          },
        ]),
      );
      expect(s.parse("13")).toEqual([13]);
    });
  });

  describe("file", () => {
    class MockFile {
      size: number;

      constructor(size: number) {
        this.size = size;
      }
    }

    beforeEach(() => {
      (global as any).File = MockFile;
    });

    afterEach(() => {
      delete (global as any).File;
    });

    it("should convert empty files to undefined", () => {
      const file = new MockFile(0);
      const s = zfd.file();
      expectError(s, file);
    });

    it("should handle optional", () => {
      const file = new MockFile(0);
      const s = zfd.file(z.instanceof(File).optional());
      expect(s.parse(file)).toEqual(undefined);
    });

    it("should return data as-is for files that are not empty", () => {
      const file = new MockFile(50);
      const s = zfd.file();
      expectValid(s, file);
    });
  });

  describe("json", () => {
    type Case = {
      value: any;
      schema: z.ZodTypeAny;
    };
    const cases: Case[] = [
      { value: {}, schema: z.object({}) },
      { value: { foo: "bar" }, schema: z.object({ foo: z.string() }) },
      {
        value: { foo: { bar: "baz" } },
        schema: z.object({ foo: z.object({ bar: z.string() }) }),
      },
      { value: [], schema: z.array(z.any()) },
      {
        value: [{ foo: "bar" }],
        schema: z.array(z.object({ foo: z.string() })),
      },
      {
        value: [{ foo: { bar: "baz" } }],
        schema: z.array(z.object({ foo: z.object({ bar: z.string() }) })),
      },
      {
        value: [{ foo: "bar" }, { bar: "baz" }],
        schema: z.array(
          z.object({ foo: z.string().optional(), bar: z.string().optional() }),
        ),
      },
      { value: "simpleString", schema: z.string() },
      { value: 12345, schema: z.number() },
      { value: true, schema: z.boolean() },
    ];

    it.each(cases)("should correctly parse $value", ({ value, schema }) => {
      const s = zfd.json(schema);
      expect(s.parse(JSON.stringify(value))).toEqual(value);
    });

    it("should correctly error when invalid", () => {
      const s = zfd.json(z.object({}));
      expectError(s, JSON.stringify([]));
    });

    it("should return undefined for empty strings", () => {
      const s = zfd.json(z.object({}).optional());
      expect(s.parse("")).toBe(undefined);
    });

    it("should not fail validation but not error if invalid json string", () => {
      const s = zfd.json(z.object({}));
      expectError(s, "I am not valid json");
    });
  });

  describe("formData", () => {
    it("should gather up repeated fields into arrays and leave single fields alone", () => {
      const s = zfd.formData({
        name: z.any(),
        checkboxGroup: z.any(),
      });

      const formData = new TestFormData();
      formData.append("name", "Someone");
      formData.append("checkboxGroup", "value1");
      formData.append("checkboxGroup", "value2");

      expect(s.parse(formData)).toEqual({
        name: "Someone",
        checkboxGroup: ["value1", "value2"],
      });
    });

    it("should handle arrays of objects", () => {
      const s = zfd.formData({
        todos: zfd.repeatable(
          z.array(z.object({ title: zfd.text(), description: zfd.text() })),
        ),
      });

      const formData = new TestFormData();
      formData.append("todos[0].title", "title 1");
      formData.append("todos[0].description", "description 1");
      formData.append("todos[1].title", "title 2");
      formData.append("todos[1].description", "description 2");

      expect(s.parse(formData)).toEqual({
        todos: [
          { title: "title 1", description: "description 1" },
          { title: "title 2", description: "description 2" },
        ],
      });
    });

    it("should work with object schemas", () => {
      const s = zfd.formData(
        z.object({
          name: z.any(),
          checkboxGroup: z.any(),
        }),
      );

      const formData = new TestFormData();
      formData.append("name", "Someone");
      formData.append("checkboxGroup", "value1");
      formData.append("checkboxGroup", "value2");

      expect(s.parse(formData)).toEqual({
        name: "Someone",
        checkboxGroup: ["value1", "value2"],
      });
    });

    it("should combo well with other helpers", () => {
      const s = zfd.formData({
        name: zfd.text(z.string().optional()),
        checkboxGroup: zfd.repeatable(),
      });

      const formData = new TestFormData();
      formData.append("name", "");
      formData.append("checkboxGroup", "value1");

      expect(s.parse(formData)).toEqual({
        checkboxGroup: ["value1"],
      });
    });

    it("should work with URLSearchParams", () => {
      const s = zfd.formData({
        name: z.any(),
        checkboxGroup: z.any(),
      });

      const formData = new URLSearchParams();
      formData.append("name", "Someone");
      formData.append("checkboxGroup", "value1");
      formData.append("checkboxGroup", "value2");

      expect(s.parse(formData)).toEqual({
        name: "Someone",
        checkboxGroup: ["value1", "value2"],
      });
    });

    it("should work with objects", () => {
      const s = zfd.formData({
        name: z.any(),
        checkboxGroup: z.any(),
      });

      const formData = {
        name: "Someone",
        checkboxGroup: "value1",
      };

      expect(s.parse(formData)).toEqual({
        name: "Someone",
        checkboxGroup: "value1",
      });
    });
  });

  describe("preprocessFormData", () => {
    it("should expose the same transformation as formData", () => {
      const formData = new TestFormData();
      formData.append("name", "Someone");
      formData.append("checkboxGroup", "value1");
      formData.append("checkboxGroup", "value2");

      const result = zfd.preprocessFormData(formData);

      expect(result).toEqual({
        name: "Someone",
        checkboxGroup: ["value1", "value2"],
      });
    });
  });
});
