import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const testHome = join(tmpdir(), `skillsync-reg-test-${Date.now()}`);
process.env.HOME = testHome;

import { loadState, saveState, recordSync, DEFAULT_STATE } from '../../src/core/registry';

describe('registry', () => {
  beforeEach(() => mkdirSync(join(testHome, '.skillsync'), { recursive: true }));
  afterEach(() => rmSync(testHome, { recursive: true, force: true }));

  it('returns default state when none exists', () => {
    const state = loadState();
    expect(state).toEqual(DEFAULT_STATE);
  });

  it('recordSync saves synced timestamp and per-target hash', () => {
    let state = loadState();
    state = recordSync(state, 'my-skill', 'claude', 'abc123');
    saveState(state);
    const loaded = loadState();
    expect(loaded.syncedAt['my-skill']['claude']).toBeDefined();
    expect(loaded.syncedHashes['my-skill']['claude']).toBe('abc123');
  });

  it('different targets store independent hashes', () => {
    let state = loadState();
    state = recordSync(state, 'my-skill', 'claude', 'hash-a');
    state = recordSync(state, 'my-skill', 'cursor', 'hash-b');
    saveState(state);
    const loaded = loadState();
    expect(loaded.syncedHashes['my-skill']['claude']).toBe('hash-a');
    expect(loaded.syncedHashes['my-skill']['cursor']).toBe('hash-b');
  });
});
