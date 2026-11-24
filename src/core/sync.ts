import {
  cpSync,
  lstatSync,
  mkdirSync,
  rmSync,
  statSync,
  symlinkSync,
} from "node:fs";
import { join } from "node:path";
import type {
  Skill,
  SyncAction,
  SyncMode,
  SyncPlan,
  Target,
} from "../types/index.js";
import { hashSkillDirSync } from "./skill.js";

type SyncedHashes = Record<string, Record<string, string>>; // skillId -> targetId -> hash

// existsSync follows symlinks, so it reports a dangling link as missing.
function pathExists(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch {
    return false;
  }
}

// Hash of what is currently at the destination, or undefined if there is
// nothing worth preserving (missing path or dangling symlink).
function destHash(path: string): string | undefined {
  let isLink: boolean;
  try {
    isLink = lstatSync(path).isSymbolicLink();
  } catch {
    return undefined;
  }
  try {
    return hashSkillDirSync(path);
  } catch {
    // Only a dangling link (target doesn't exist) is safe to replace. A link
    // to a file, an unreadable directory, etc. is foreign content.
    return isLink && isDangling(path) ? undefined : "";
  }
}

function isDangling(path: string): boolean {
  try {
    statSync(path);
    return false;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    return code === "ENOENT" || code === "ENOTDIR";
  }
}

export function planSync(
  skills: Skill[],
  targets: Target[],
  syncedHashes: SyncedHashes,
  options: { force?: boolean } = {},
): SyncPlan {
  const actions: SyncAction[] = [];

  for (const skill of skills) {
    for (const target of targets) {
      for (const targetBasePath of target.paths) {
        const destPath = join(targetBasePath, skill.id);
        const prevHash = syncedHashes[skill.id]?.[target.id];

        let type: SyncAction["type"];
        if (!prevHash) {
          type = "create";
        } else if (prevHash === skill.hash) {
          type = "skip";
        } else {
          type = "update";
        }

        // Don't clobber content we didn't write: a pre-existing skill on first
        // sync, or local edits made at the destination since the last sync.
        if (type !== "skip" && !options.force) {
          const current = destHash(destPath);
          if (
            current !== undefined &&
            current !== skill.hash &&
            current !== prevHash
          ) {
            type = "conflict";
          }
        }

        actions.push({
          type,
          skillId: skill.id,
          targetId: target.id,
          sourcePath: skill.path,
          destPath,
        });
      }
    }
  }

  return { actions, dryRun: false };
}

export async function applyPlan(plan: SyncPlan, mode: SyncMode): Promise<void> {
  if (plan.dryRun) return;

  for (const action of plan.actions) {
    if (action.type === "skip" || action.type === "conflict") continue;

    mkdirSync(join(action.destPath, ".."), { recursive: true });

    if (pathExists(action.destPath)) {
      rmSync(action.destPath, { recursive: true, force: true });
    }

    if (mode === "link") {
      symlinkSync(action.sourcePath, action.destPath);
    } else {
      cpSync(action.sourcePath, action.destPath, { recursive: true });
    }
  }
}
