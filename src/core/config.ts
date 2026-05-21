// src/core/config.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { z } from 'zod';
import type { Config } from '../types/index.js';

const ConfigSchema = z.object({
  repoPath: z.string(),
  defaultMode: z.enum(['copy', 'link']),
  targets: z.array(z.string()),
  ignorePatterns: z.array(z.string()),
});

export const DEFAULT_CONFIG: Config = {
  repoPath: join(homedir(), '.skillsync', 'skills'),
  defaultMode: 'copy',
  targets: [],
  ignorePatterns: [],
};

export function getSkillsyncDir(): string {
  return join(homedir(), '.skillsync');
}

export function getConfigPath(): string {
  return join(getSkillsyncDir(), 'config.json');
}

export function getRepoPath(): string {
  return join(getSkillsyncDir(), 'skills');
}

export function getStatePath(): string {
  return join(getSkillsyncDir(), 'state.json');
}

export function loadConfig(): Config {
  const path = getConfigPath();
  if (!existsSync(path)) return { ...DEFAULT_CONFIG };
  const raw = JSON.parse(readFileSync(path, 'utf-8'));
  return ConfigSchema.parse(raw);
}

export function saveConfig(config: Config): void {
  const dir = getSkillsyncDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(getConfigPath(), JSON.stringify(config, null, 2));
}
