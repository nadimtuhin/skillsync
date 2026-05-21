import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const testHome = join(tmpdir(), `skillsync-claude-test-${Date.now()}`);
process.env.HOME = testHome;

import { ClaudeAdapter } from "../../src/adapters/claude";

describe("ClaudeAdapter", () => {
  afterEach(() => rmSync(testHome, { recursive: true, force: true }));

  it('id is "claude"', () => {
    expect(new ClaudeAdapter().id).toBe("claude");
  });

  it("detected when ~/.claude dir exists", async () => {
    mkdirSync(join(testHome, ".claude"), { recursive: true });
    expect(await new ClaudeAdapter().detect()).toBe(true);
  });

  it("not detected when ~/.claude dir missing", async () => {
    expect(await new ClaudeAdapter().detect()).toBe(false);
  });

  it("supportsLink returns true on non-windows", () => {
    expect(new ClaudeAdapter().supportsLink()).toBe(
      process.platform !== "win32",
    );
  });

  it("getPaths returns ~/.claude/skills path", () => {
    const paths = new ClaudeAdapter().getPaths();
    expect(paths.length).toBeGreaterThan(0);
    expect(paths[0]).toBe(join(testHome, ".claude", "skills"));
  });
});
