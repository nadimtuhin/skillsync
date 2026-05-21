import { describe, it, expect } from 'vitest';
import { join, resolve } from 'node:path';
import { scanSkills, hashSkillDir, skillIdFromPath } from '../../src/core/skill';

const FIXTURES = resolve('fixtures/skills');

describe('skill scanner', () => {
  it('skillIdFromPath normalizes to kebab-case folder name', () => {
    expect(skillIdFromPath('/home/user/.skillsync/skills/my-skill')).toBe('my-skill');
  });

  it('scanSkills returns skills from fixture dir', async () => {
    const skills = await scanSkills(FIXTURES);
    const ids = skills.map(s => s.id);
    expect(ids).toContain('valid-skill');
  });

  it('valid-skill has non-empty hash', async () => {
    const skills = await scanSkills(FIXTURES);
    const skill = skills.find(s => s.id === 'valid-skill');
    expect(skill?.hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('hashSkillDir returns same hash for same content', async () => {
    const path = join(FIXTURES, 'valid-skill');
    const h1 = await hashSkillDir(path);
    const h2 = await hashSkillDir(path);
    expect(h1).toBe(h2);
  });
});
