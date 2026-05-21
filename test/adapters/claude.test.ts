import { describe, expect, it } from "vitest";
import { ClaudeAdapter } from "../../src/adapters/claude";

describe("ClaudeAdapter", () => {
  const adapter = new ClaudeAdapter();

  it('id is "claude"', () => {
    expect(adapter.id).toBe("claude");
  });

  it("name is descriptive", () => {
    expect(adapter.name).toBe("Claude Code");
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
