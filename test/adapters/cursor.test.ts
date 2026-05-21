import { describe, expect, it } from "vitest";
import { CursorAdapter } from "../../src/adapters/cursor";

describe("CursorAdapter", () => {
  const adapter = new CursorAdapter();

  it('id is "cursor"', () => {
    expect(adapter.id).toBe("cursor");
  });

  it("name is descriptive", () => {
    expect(adapter.name).toBe("Cursor");
  });

  it("getPaths returns array", () => {
    const paths = adapter.getPaths();
    expect(Array.isArray(paths)).toBe(true);
    expect(paths.length).toBeGreaterThan(0);
  });

  it("supportsLink returns boolean", () => {
    const supports = adapter.supportsLink();
    expect(typeof supports).toBe("boolean");
  });
});
