import { mkdirSync, rmSync } from "node:fs";
import * as os from "node:os";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const testHome = join(tmpdir(), `skillsync-reg-test-${Date.now()}`);

vi.spyOn(os, "homedir").mockReturnValue(testHome);

import {
  DEFAULT_STATE,
  loadState,
  recordSync,
  saveState,
} from "../../src/core/registry";

describe("registry", () => {
  beforeEach(() =>
    mkdirSync(join(testHome, ".skillsync"), { recursive: true }),
  );
  afterEach(() => rmSync(testHome, { recursive: true, force: true }));

  it("returns default state when none exists", () => {
    const state = loadState();
    expect(state).toEqual(DEFAULT_STATE);
  });

  it("recordSync saves synced timestamp and per-target hash", () => {
    let state = loadState();
    state = recordSync(state, "my-skill", "claude", "abc123");
    saveState(state);
    const loaded = loadState();
    expect(loaded.syncedAt["my-skill"].claude).toBeDefined();
    expect(loaded.syncedHashes["my-skill"].claude).toBe("abc123");
  });

  it("different targets store independent hashes", () => {
    let state = loadState();
    state = recordSync(state, "my-skill", "claude", "hash-a");
    state = recordSync(state, "my-skill", "cursor", "hash-b");
    saveState(state);
    const loaded = loadState();
    expect(loaded.syncedHashes["my-skill"].claude).toBe("hash-a");
    expect(loaded.syncedHashes["my-skill"].cursor).toBe("hash-b");
  });
});
