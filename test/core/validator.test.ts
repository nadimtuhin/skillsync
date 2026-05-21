import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { validateSkill } from '../../src/core/validator';
import type { Skill } from '../../src/types/index';

const FIXTURES = resolve('fixtures/skills');

function makeSkill(id: string, path: string): Skill {
  return { id, name: id, path, tags: [], hash: 'abc', lastSyncedAt: {} };
}

describe('validateSkill', () => {
  it('valid skill with .md file passes', () => {
    const result = validateSkill(makeSkill('valid-skill', `${FIXTURES}/valid-skill`));
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('empty dir fails with "no .md files" error', () => {
    const result = validateSkill(makeSkill('invalid-skill', `${FIXTURES}/invalid-skill`));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/no .md files/i);
  });

  it('non-existent path fails', () => {
    const result = validateSkill(makeSkill('ghost', '/nonexistent/ghost'));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/does not exist/i);
  });

  it('id with spaces fails', () => {
    const result = validateSkill(makeSkill('bad name', `${FIXTURES}/valid-skill`));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/id must be kebab-case/i);
  });
});
