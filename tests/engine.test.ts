import { describe, it, expect } from "vitest";
import { evaluate, normalizeInputs } from "../src/engine/evaluator";
import { RULES, demoInputs, emptyInputs } from "../src/engine/rules";
import type { Inputs } from "../src/engine/types";
describe("explainable four-condition rules", () => {
  it("starts pending and never treats missing data as safe", () => {
    expect(evaluate(emptyInputs())).toMatchObject({
      passed: 0,
      outside: 0,
      pending: 4,
      coverage: 0,
      status: "pending",
    });
  });
  it("evaluates the labelled demonstration baseline", () => {
    expect(evaluate(demoInputs())).toMatchObject({
      passed: 4,
      outside: 0,
      pending: 0,
      coverage: 100,
      status: "within",
    });
  });
  for (const rule of RULES) {
    it(`${rule.id} includes lower bound`, () => {
      const data = demoInputs({ [rule.field]: rule.min ?? 0 });
      expect(
        evaluate(data).results.find((r) => r.rule.id === rule.id)?.status,
      ).toBe("pass");
    });
    it(`${rule.id} includes upper bound`, () => {
      const data = demoInputs({ [rule.field]: rule.max });
      expect(
        evaluate(data).results.find((r) => r.rule.id === rule.id)?.status,
      ).toBe("pass");
    });
    it(`${rule.id} rejects above upper bound`, () => {
      const data = demoInputs({ [rule.field]: rule.max + 0.01 });
      expect(
        evaluate(data).results.find((r) => r.rule.id === rule.id)?.status,
      ).toBe("outside");
    });
    it(`${rule.id} leaves null pending`, () => {
      expect(evaluate(demoInputs({ [rule.field]: null })).pending).toBe(1);
    });
    it(`${rule.id} rejects NaN`, () => {
      const data = demoInputs({ [rule.field]: NaN });
      expect(
        evaluate(data).results.find((r) => r.rule.id === rule.id)?.status,
      ).toBe("invalid");
    });
    it(`${rule.id} does not accept model output as matching observation`, () => {
      const data = demoInputs();
      data[rule.field].origin = "model";
      expect(
        evaluate(data).results.find((r) => r.rule.id === rule.id)?.status,
      ).toBe("reference");
    });
  }
  it("reports two independent failures", () => {
    expect(
      evaluate(demoInputs({ temperature: 26, salinity: 26 })),
    ).toMatchObject({ passed: 2, outside: 2, pending: 0, status: "outside" });
  });
  it("outside takes priority when other values are missing", () => {
    expect(
      evaluate(demoInputs({ temperature: 26, salinity: null })),
    ).toMatchObject({ outside: 1, pending: 1, status: "outside" });
  });
  it("does not mutate inputs", () => {
    const input = demoInputs();
    const before = JSON.stringify(input);
    evaluate(input);
    expect(JSON.stringify(input)).toBe(before);
  });
  it("can round-trip a valid input object", () => {
    expect(normalizeInputs(JSON.parse(JSON.stringify(demoInputs())))).toEqual(
      demoInputs(),
    );
  });
  it("rejects absent keys", () => {
    expect(() => normalizeInputs({})).toThrow();
  });
  it("rejects numeric strings rather than coercing them", () => {
    const v = demoInputs() as unknown as Record<string, unknown>;
    v.temperature = { value: "18", origin: "manual" };
    expect(() => normalizeInputs(v)).toThrow();
  });
  it("rejects false provenance", () => {
    const v = demoInputs() as unknown as Record<string, unknown>;
    v.temperature = { value: 18, origin: "sensor-certified" };
    expect(() => normalizeInputs(v)).toThrow();
  });
  it("rejects impossible physical values", () => {
    expect(() => normalizeInputs(demoInputs({ depth: -1 }))).toThrow();
  });
  it("normalization strips unrelated fields", () => {
    expect(
      Object.keys(normalizeInputs({ ...demoInputs(), injected: "ignore" })),
    ).toHaveLength(4);
  });
});
