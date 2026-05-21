import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import type { Skill } from "../types/index.js";

export function skillIdFromPath(skillPath: string): string {
  return basename(skillPath);
}

export async function hashSkillDir(skillPath: string): Promise<string> {
  const hash = createHash("sha256");
  const entries = readdirSync(skillPath).sort();
  for (const entry of entries) {
    const entryPath = join(skillPath, entry);
    const stat = statSync(entryPath);
    if (stat.isFile()) {
      hash.update(entry);
      hash.update(readFileSync(entryPath));
    }
  }
  return hash.digest("hex");
}

export async function scanSkills(repoPath: string): Promise<Skill[]> {
  if (!existsSync(repoPath)) return [];
  const entries = readdirSync(repoPath);
  const skills: Skill[] = [];

  for (const entry of entries) {
    const skillPath = join(repoPath, entry);
    const stat = statSync(skillPath);
    if (!stat.isDirectory()) continue;

    const hash = await hashSkillDir(skillPath);
    skills.push({
      id: skillIdFromPath(skillPath),
      name: entry,
      path: skillPath,
      tags: [],
      hash,
      lastSyncedAt: {},
    });
  }

  return skills;
}
