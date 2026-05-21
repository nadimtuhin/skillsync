// src/types/index.ts
export type SyncMode = "copy" | "link";
export type SyncActionType = "create" | "update" | "skip" | "conflict";

export interface Skill {
  id: string; // normalized kebab-case folder name
  name: string; // display name
  path: string; // absolute path in central repo
  source?: string; // e.g. 'imported-from-claude'
  tags: string[];
  hash: string; // sha256 of all file contents
  lastSyncedAt: Record<string, string>; // targetId -> ISO date
}

export interface Target {
  id: string; // 'claude' | 'cursor' | 'codex'
  name: string;
  paths: string[]; // resolved absolute paths to sync into
  supportsLink: boolean;
  detected: boolean;
}

export interface SyncAction {
  type: SyncActionType;
  skillId: string;
  targetId: string;
  sourcePath: string;
  destPath: string;
  reason?: string;
}

export interface SyncPlan {
  actions: SyncAction[];
  dryRun: boolean;
}

export interface Config {
  repoPath: string;
  defaultMode: SyncMode;
  targets: string[];
  ignorePatterns: string[];
}

export interface State {
  syncedAt: Record<string, Record<string, string>>; // skillId -> targetId -> ISO date
  syncedHashes: Record<string, Record<string, string>>; // skillId -> targetId -> hash at last sync
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
