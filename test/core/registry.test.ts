import { describe, expect, it } from "vitest";
import {
  DEFAULT_STATE,
  recordSync,
} from "../../src/core/registry";

describe("registry", () => {
  it("DEFAULT_STATE has correct structure", () => {
    expect(DEFAULT_STATE).toHaveProperty("syncedAt");
    expect(DEFAULT_STATE).toHaveProperty("syncedHashes");
    expect(DEFAULT_STATE.syncedAt).toEqual({});
    expect(DEFAULT_STATE.syncedHashes).toEqual({});
  });

  it("recordSync adds skill entry with target", () => {
    let state = { syncedAt: {}, syncedHashes: {} };
    state = recordSync(state, "my-skill", "claude", "abc123");
    expect(state.syncedHashes["my-skill"]).toBeDefined();
    expect(state.syncedHashes["my-skill"].claude).toBe("abc123");
  });

  it("recordSync adds timestamp for synced skill", () => {
    let state = { syncedAt: {}, syncedHashes: {} };
    state = recordSync(state, "my-skill", "claude", "abc123");
    expect(state.syncedAt["my-skill"]).toBeDefined();
    expect(state.syncedAt["my-skill"].claude).toBeDefined();
  });

  it("recordSync preserves independent per-target hashes", () => {
    let state = { syncedAt: {}, syncedHashes: {} };
    state = recordSync(state, "my-skill", "claude", "hash-a");
    state = recordSync(state, "my-skill", "cursor", "hash-b");
    expect(state.syncedHashes["my-skill"].claude).toBe("hash-a");
    expect(state.syncedHashes["my-skill"].cursor).toBe("hash-b");
  });
});
