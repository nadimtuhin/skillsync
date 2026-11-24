import { createHash, type Hash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import type { Skill } from "../types/index.js";

export function skillIdFromPath(skillPath: string): string {
  return basename(skillPath);
}

export async function hashSkillDir(skillPath: string): Promise<string> {
  return hashSkillDirSync(skillPath);
}

export function hashSkillDirSync(skillPath: string): string {
  const hash = createHash("sha256");
  hashDirInto(hash, skillPath, "");
  return hash.digest("hex");
}

// Recurses into subdirectories so nested files (e.g. references/*.md) are
// covered. Top-level files hash exactly as before (name + contents), so
// existing flat skills keep their hashes.
function hashDirInto(hash: Hash, dir: string, prefix: string): void {
  for (const entry of readdirSync(dir).sort()) {
    const entryPath = join(dir, entry);
    const rel = prefix ? `${prefix}/${entry}` : entry;
    const stat = statSync(entryPath);
    if (stat.isFile()) {
      hash.update(rel);
      hash.update(readFileSync(entryPath));
    } else if (stat.isDirectory()) {
      hashDirInto(hash, entryPath, rel);
    }
  }
}

export async function scanSkills(repoPath: string): Promise<Skill[]> {
  if (!existsSync(repoPath)) return [];
  const entries = readdirSync(repoPath);
  const skills: Skill[] = [];

  for (const entry of entries) {
    // Skip hidden entries such as .git when the repo is under version control.
    if (entry.startsWith(".")) continue;
    const skillPath = join(repoPath, entry);
    let stat: ReturnType<typeof statSync>;
    try {
      stat = statSync(skillPath);
    } catch {
      continue; // dangling symlink or unreadable entry
    }
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
