// test/core/config.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// Override home dir for tests
const testHome = join(tmpdir(), `skillsync-test-${Date.now()}`);
process.env.HOME = testHome;

import { loadConfig, saveConfig, getConfigPath, getRepoPath, DEFAULT_CONFIG } from '../../src/core/config';

describe('config', () => {
  beforeEach(() => mkdirSync(join(testHome, '.skillsync'), { recursive: true }));
  afterEach(() => rmSync(testHome, { recursive: true, force: true }));

  it('returns default config when none exists', () => {
    const config = loadConfig();
    expect(config.defaultMode).toBe('copy');
    expect(config.targets).toEqual([]);
    expect(config.ignorePatterns).toEqual([]);
  });

  it('saves and reloads config', () => {
    const cfg = { ...DEFAULT_CONFIG, defaultMode: 'link' as const };
    saveConfig(cfg);
    const loaded = loadConfig();
    expect(loaded.defaultMode).toBe('link');
  });

  it('getConfigPath returns ~/.skillsync/config.json', () => {
    expect(getConfigPath()).toBe(join(testHome, '.skillsync', 'config.json'));
  });

  it('getRepoPath returns ~/.skillsync/skills', () => {
    expect(getRepoPath()).toBe(join(testHome, '.skillsync', 'skills'));
  });
});
