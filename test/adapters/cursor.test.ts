import { describe, it, expect, afterEach } from 'vitest';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const testHome = join(tmpdir(), `skillsync-cursor-test-${Date.now()}`);
process.env.HOME = testHome;

import { CursorAdapter } from '../../src/adapters/cursor';

describe('CursorAdapter', () => {
  afterEach(() => rmSync(testHome, { recursive: true, force: true }));

  it('id is "cursor"', () => {
    expect(new CursorAdapter().id).toBe('cursor');
  });

  it('detected when ~/.cursor dir exists', async () => {
    mkdirSync(join(testHome, '.cursor'), { recursive: true });
    expect(await new CursorAdapter().detect()).toBe(true);
  });

  it('not detected when ~/.cursor missing', async () => {
    expect(await new CursorAdapter().detect()).toBe(false);
  });

  it('getPaths returns ~/.cursor/rules path', () => {
    const paths = new CursorAdapter().getPaths();
    expect(paths[0]).toBe(join(testHome, '.cursor', 'rules'));
  });
});
