import { cpSync, existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import type {
  Skill,
  SyncAction,
  SyncMode,
  SyncPlan,
  Target,
} from "../types/index.js";

type SyncedHashes = Record<string, Record<string, string>>; // skillId -> targetId -> hash

export function planSync(
  skills: Skill[],
  targets: Target[],
  syncedHashes: SyncedHashes,
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
    if (action.type === "skip") continue;

    mkdirSync(join(action.destPath, ".."), { recursive: true });

    if (existsSync(action.destPath)) {
      rmSync(action.destPath, { recursive: true, force: true });
    }

    if (mode === "link") {
      symlinkSync(action.sourcePath, action.destPath);
    } else {
      cpSync(action.sourcePath, action.destPath, { recursive: true });
    }
  }
}
