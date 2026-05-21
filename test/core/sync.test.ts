import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyPlan, planSync } from "../../src/core/sync";
import type { Skill, Target } from "../../src/types/index";

const tmp = join(tmpdir(), `skillsync-sync-test-${Date.now()}`);

function makeSkill(id: string): Skill {
  const path = join(tmp, "skills", id);
  mkdirSync(path, { recursive: true });
  writeFileSync(join(path, "skill.md"), `# ${id}`);
  return { id, name: id, path, tags: [], hash: "abc123", lastSyncedAt: {} };
}

function makeTarget(id: string): Target {
  const targetPath = join(tmp, "targets", id);
  mkdirSync(targetPath, { recursive: true });
  return {
    id,
    name: id,
    paths: [targetPath],
    supportsLink: true,
    detected: true,
  };
}

describe("planSync", () => {
  beforeEach(() => mkdirSync(tmp, { recursive: true }));
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it("creates action for new skill not yet synced", () => {
    const skill = makeSkill("my-skill");
    const target = makeTarget("claude");
    const plan = planSync([skill], [target], {});
    expect(plan.actions).toHaveLength(1);
    expect(plan.actions[0].type).toBe("create");
  });

  it("skips skill already synced with same hash", () => {
    const skill = makeSkill("my-skill");
    const target = makeTarget("claude");
    const syncedHashes = { "my-skill": { claude: "abc123" } };
    const plan = planSync([skill], [target], syncedHashes);
    expect(plan.actions[0].type).toBe("skip");
  });

  it("updates skill when hash changed", () => {
    const skill = makeSkill("my-skill");
    const target = makeTarget("claude");
    const syncedHashes = { "my-skill": { claude: "old-hash" } };
    const plan = planSync([skill], [target], syncedHashes);
    expect(plan.actions[0].type).toBe("update");
  });
});

describe("applyPlan", () => {
  beforeEach(() => mkdirSync(tmp, { recursive: true }));
  afterEach(() => rmSync(tmp, { recursive: true, force: true }));

  it("copy mode creates skill directory at dest", async () => {
    const skill = makeSkill("copy-skill");
    const target = makeTarget("claude");
    const plan = planSync([skill], [target], {});
    await applyPlan(plan, "copy");
    expect(existsSync(join(tmp, "targets", "claude", "copy-skill"))).toBe(true);
  });
});
