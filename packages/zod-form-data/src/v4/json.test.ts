import { describe, it, expect } from "vitest";
import { z } from "zod";
import * as core from "zod/v4/core";
import { json } from "./json";
import { expectError } from "../test/lib";

describe("zod v4 json", () => {
  type Case = {
    value: any;
    schema: core.$ZodType;
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
      schema: z.object({ foo: z.string() }).array(),
    },
    {
      value: [{ foo: { bar: "baz" } }],
      schema: z.object({ foo: z.object({ bar: z.string() }) }).array(),
    },
    {
      value: [{ foo: "bar" }, { bar: "baz" }],
      schema: z
        .object({ foo: z.string().optional(), bar: z.string().optional() })
        .array(),
    },
    { value: "simpleString", schema: z.string() },
    { value: 12345, schema: z.number() },
    { value: true, schema: z.boolean() },
  ];

  it.each(cases)("should correctly parse $value", ({ value, schema }) => {
    const s = json(schema);
    expect(s.parse(JSON.stringify(value))).toEqual(value);
  });

  it("should correctly error when invalid", () => {
    const s = json(z.object({}));
    expectError(s, JSON.stringify([]));
  });

  it("should return undefined for empty strings", () => {
    const s = json(z.object({}).optional());
    expect(s.parse("")).toBeUndefined();
  });

  it("should return null for empty strings when 'empty' is set to null", () => {
    const s = json(z.object({}).nullable(), null);
    expect(s.parse("")).toBeNull();
  });

  it("should not fail validation but not error if invalid json string", () => {
    const s = json(z.object({}));
    expectError(s, "I am not valid json");
  });
});
