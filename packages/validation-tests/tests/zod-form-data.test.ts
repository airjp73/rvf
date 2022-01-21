import { z } from "zod";
import { zfd } from "zod-form-data";
import { TestFormData } from "./util";

const expectError = (schema: z.Schema<any>, val: any) => {
  expect(schema.safeParse(val)).toEqual({
    error: expect.any(z.ZodError),
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
  });

  describe("repeatableOfType", () => {
    it("should accept schema for item type", () => {
      const s = zfd.repeatableOfType(zfd.numeric(z.number().min(13)));
      expectError(s, "12");
      expect(s.parse("13")).toEqual([13]);
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
});
