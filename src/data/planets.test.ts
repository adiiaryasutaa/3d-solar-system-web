import { describe, expect, it } from "vitest";
import { PLANETS, SUN, getBodyById, type PlanetFacts } from "./planets";

const FACT_KEYS: (keyof PlanetFacts)[] = [
  "type",
  "diameter",
  "distanceFromSun",
  "dayLength",
  "yearLength",
  "moons",
  "gravity",
  "temperature",
  "atmosphere",
  "summary",
  "funFact",
];

describe("planet data", () => {
  it("has 8 planets", () => {
    expect(PLANETS).toHaveLength(8);
  });

  it("has unique ids across the Sun and planets", () => {
    const ids = [SUN.id, ...PLANETS.map((p) => p.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has positive radii", () => {
    for (const p of PLANETS) expect(p.radius).toBeGreaterThan(0);
    expect(SUN.radius).toBeGreaterThan(0);
  });

  it("orders planets by strictly increasing orbit radius", () => {
    for (let i = 1; i < PLANETS.length; i++) {
      expect(PLANETS[i].orbitRadius).toBeGreaterThan(PLANETS[i - 1].orbitRadius);
    }
  });

  it("gives every body a complete set of facts", () => {
    for (const body of [SUN, ...PLANETS]) {
      for (const key of FACT_KEYS) {
        expect(body.facts[key]).toBeTruthy();
      }
    }
  });
});

describe("getBodyById", () => {
  it("resolves the Sun", () => {
    expect(getBodyById("sun")?.name).toBe("Sun");
  });

  it("resolves each planet", () => {
    for (const p of PLANETS) {
      expect(getBodyById(p.id)?.id).toBe(p.id);
    }
  });

  it("returns undefined for null and unknown ids", () => {
    expect(getBodyById(null)).toBeUndefined();
    expect(getBodyById("pluto")).toBeUndefined();
  });
});
