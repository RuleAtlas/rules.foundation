import { describe, it, expect } from "vitest";
import { naturalCompare } from "./natural-sort";

describe("naturalCompare", () => {
  it("sorts strings with numbers naturally", () => {
    const items = ["Title 10", "Title 2", "Title 1", "Title 20"];
    const sorted = items.sort(naturalCompare);
    expect(sorted).toEqual(["Title 1", "Title 2", "Title 10", "Title 20"]);
  });

  it("sorts plain strings alphabetically", () => {
    const items = ["banana", "apple", "cherry"];
    const sorted = items.sort(naturalCompare);
    expect(sorted).toEqual(["apple", "banana", "cherry"]);
  });

  it("is case-insensitive", () => {
    expect(naturalCompare("Apple", "apple")).toBe(0);
  });

  it("handles empty strings", () => {
    expect(naturalCompare("", "a")).toBeLessThan(0);
    expect(naturalCompare("a", "")).toBeGreaterThan(0);
  });

  it("handles equal strings", () => {
    expect(naturalCompare("same", "same")).toBe(0);
  });

  it("sorts numeric-only strings naturally", () => {
    const items = ["10", "2", "1", "20"];
    const sorted = items.sort(naturalCompare);
    expect(sorted).toEqual(["1", "2", "10", "20"]);
  });
});
