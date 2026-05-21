import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { State } from '../types/index.js';
import { getSkillsyncDir, getStatePath } from './config.js';

export const DEFAULT_STATE: State = {
  syncedAt: {},
  syncedHashes: {},
};

export function loadState(): State {
  const path = getStatePath();
  if (!existsSync(path)) return { syncedAt: {}, syncedHashes: {} };
  return JSON.parse(readFileSync(path, 'utf-8')) as State;
}

export function saveState(state: State): void {
  const dir = getSkillsyncDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(getStatePath(), JSON.stringify(state, null, 2));
}

export function recordSync(state: State, skillId: string, targetId: string, hash: string): State {
  return {
    ...state,
    syncedAt: {
      ...state.syncedAt,
      [skillId]: { ...(state.syncedAt[skillId] ?? {}), [targetId]: new Date().toISOString() },
    },
    syncedHashes: {
      ...state.syncedHashes,
      [skillId]: { ...(state.syncedHashes[skillId] ?? {}), [targetId]: hash },
    },
  };
}
