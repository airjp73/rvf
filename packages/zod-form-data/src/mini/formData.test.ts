import { describe, it, expect } from "vitest";
import { z } from "zod/mini";
import { TestFormData } from "@remix-validated-form/test-utils";

import { file } from "./file";
import { formData, preprocessFormData } from "./formData";
import { repeatable } from "./repeatable";
import { expectError } from "../test/lib";
import { text } from "./text";

describe("zfd mini formData", () => {
  it("should gather up repeated fields into arrays and leave single fields alone", () => {
    const s = formData({
      name: z.any(),
      checkboxGroup: z.any(),
    });

    const data = new TestFormData();
    data.append("name", "Someone");
    data.append("checkboxGroup", "value1");
    data.append("checkboxGroup", "value2");

    expect(s.parse(data)).toEqual({
      name: "Someone",
      checkboxGroup: ["value1", "value2"],
    });
  });

  it("should handle arrays of objects", () => {
    const s = formData({
      todos: repeatable(
        z.array(
          z.object({ title: text(z.string()), description: text(z.string()) }),
        ),
      ),
    });

    const data = new TestFormData();
    data.append("todos[0].title", "title 1");
    data.append("todos[0].description", "description 1");
    data.append("todos[1].title", "title 2");
    data.append("todos[1].description", "description 2");

    expect(s.parse(data)).toEqual({
      todos: [
        { title: "title 1", description: "description 1" },
        { title: "title 2", description: "description 2" },
      ],
    });
  });

  it("should work with object schemas", () => {
    const s = formData(
      z.object({
        name: z.any(),
        checkboxGroup: z.any(),
      }),
    );

    const data = new TestFormData();
    data.append("name", "Someone");
    data.append("checkboxGroup", "value1");
    data.append("checkboxGroup", "value2");

    expect(s.parse(data)).toEqual({
      name: "Someone",
      checkboxGroup: ["value1", "value2"],
    });
  });

  it("should combo well with other helpers", () => {
    const s = formData({
      name: text(z.optional(z.string())),
      checkboxGroup: repeatable(z.array(text(z.string()))),
    });

    const data = new TestFormData();
    data.append("name", "");
    data.append("checkboxGroup", "value1");

    expect(s.parse(data)).toEqual({
      checkboxGroup: ["value1"],
    });
  });

  it("should work with URLSearchParams", () => {
    const s = formData({
      name: z.any(),
      checkboxGroup: z.any(),
    });

    const data = new URLSearchParams();
    data.append("name", "Someone");
    data.append("checkboxGroup", "value1");
    data.append("checkboxGroup", "value2");

    expect(s.parse(data)).toEqual({
      name: "Someone",
      checkboxGroup: ["value1", "value2"],
    });
  });

  it("should work with objects", () => {
    const s = formData({
      name: z.any(),
      checkboxGroup: z.any(),
    });

    const data = {
      name: "Someone",
      checkboxGroup: "value1",
    };

    expect(s.parse(data)).toEqual({
      name: "Someone",
      checkboxGroup: "value1",
    });
  });

  it("should result fail if array is not present in FormData", () => {
    const s = formData({ myRepeatable: repeatable(z.array(z.any())) });
    expectError(s, new TestFormData());
  });

  it("should handle arrays of Files", () => {
    const s = formData({
      myRepeatable: repeatable(z.array(file())),
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

describe("zfd preprocessFormData", () => {
  it("should expose the same transformation as formData", () => {
    const data = new TestFormData();
    data.append("name", "Someone");
    data.append("checkboxGroup", "value1");
    data.append("checkboxGroup", "value2");

    const result = preprocessFormData.parse(data);

    expect(result).toEqual({
      name: "Someone",
      checkboxGroup: ["value1", "value2"],
    });
  });
});
