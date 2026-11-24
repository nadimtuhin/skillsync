import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { hashSkillDir, scanSkills } from "../../src/core/skill";
import { applyPlan, planSync } from "../../src/core/sync";
import type { Target } from "../../src/types/index";

// Path deliberately contains spaces.
const tmp = join(tmpdir(), `skillsync edge ${process.pid}-${Date.now()}`);
const repo = join(tmp, "repo dir");
const targetDir = join(tmp, "target dir");

function target(): Target {
  return {
    id: "claude",
    name: "Claude Code",
    paths: [targetDir],
    supportsLink: true,
    detected: true,
  };
}

function writeSkill(id: string, files: Record<string, string>): string {
  const dir = join(repo, id);
  for (const [rel, content] of Object.entries(files)) {
    const p = join(dir, rel);
    mkdirSync(join(p, ".."), { recursive: true });
    writeFileSync(p, content);
  }
  return dir;
}

beforeEach(() => {
  mkdirSync(repo, { recursive: true });
  mkdirSync(targetDir, { recursive: true });
});
afterEach(() => rmSync(tmp, { recursive: true, force: true }));

describe("hashSkillDir", () => {
  it("changes when a file in a nested directory changes", async () => {
    const dir = writeSkill("nested", {
      "skill.md": "# nested",
      "references/api.md": "v1",
    });
    const before = await hashSkillDir(dir);
    writeFileSync(join(dir, "references/api.md"), "v2");
    const after = await hashSkillDir(dir);
    expect(after).not.toBe(before);
  });
});

describe("scanSkills", () => {
  it("ignores hidden directories such as .git", async () => {
    writeSkill("real-skill", { "skill.md": "# real" });
    mkdirSync(join(repo, ".git", "objects"), { recursive: true });
    writeFileSync(join(repo, ".git", "HEAD"), "ref: refs/heads/main");
    const ids = (await scanSkills(repo)).map((s) => s.id);
    expect(ids).toEqual(["real-skill"]);
  });

  it("does not crash on a dangling symlink in the repo", async () => {
    writeSkill("real-skill", { "skill.md": "# real" });
    symlinkSync(join(tmp, "does-not-exist"), join(repo, "broken"));
    const ids = (await scanSkills(repo)).map((s) => s.id);
    expect(ids).toEqual(["real-skill"]);
  });
});

describe("applyPlan with an existing dangling symlink at the destination", () => {
  for (const mode of ["link", "copy"] as const) {
    it(`${mode} mode replaces the dangling link`, async () => {
      writeSkill("my-skill", { "skill.md": "# mine" });
      const dest = join(targetDir, "my-skill");
      symlinkSync(join(tmp, "old-repo", "my-skill"), dest);
      const [skill] = await scanSkills(repo);
      const plan = planSync([skill], [target()], {});
      await applyPlan(plan, mode);
      expect(readFileSync(join(dest, "skill.md"), "utf-8")).toBe("# mine");
      if (mode === "link") expect(readlinkSync(dest)).toBe(skill.path);
      else expect(lstatSync(dest).isSymbolicLink()).toBe(false);
    });
  }
});

describe("conflicting edits at the destination", () => {
  it("does not overwrite a pre-existing, different skill on first sync", async () => {
    writeSkill("my-skill", { "skill.md": "# from repo" });
    const dest = join(targetDir, "my-skill");
    mkdirSync(dest);
    writeFileSync(join(dest, "skill.md"), "# user's own version");
    const [skill] = await scanSkills(repo);
    const plan = planSync([skill], [target()], {});
    expect(plan.actions[0].type).toBe("conflict");
    await applyPlan(plan, "copy");
    expect(readFileSync(join(dest, "skill.md"), "utf-8")).toBe(
      "# user's own version",
    );
  });

  it("does not overwrite local edits made since the last sync", async () => {
    writeSkill("my-skill", { "skill.md": "v1" });
    let [skill] = await scanSkills(repo);
    await applyPlan(planSync([skill], [target()], {}), "copy");
    const synced = { "my-skill": { claude: skill.hash } };

    const dest = join(targetDir, "my-skill");
    writeFileSync(join(dest, "skill.md"), "v1 + local edit");
    writeFileSync(join(skill.path, "skill.md"), "v2");
    [skill] = await scanSkills(repo);

    const plan = planSync([skill], [target()], synced);
    expect(plan.actions[0].type).toBe("conflict");
    await applyPlan(plan, "copy");
    expect(readFileSync(join(dest, "skill.md"), "utf-8")).toBe(
      "v1 + local edit",
    );
  });

  it("--force overwrites conflicts", async () => {
    writeSkill("my-skill", { "skill.md": "# from repo" });
    const dest = join(targetDir, "my-skill");
    mkdirSync(dest);
    writeFileSync(join(dest, "skill.md"), "# other");
    const [skill] = await scanSkills(repo);
    const plan = planSync([skill], [target()], {}, { force: true });
    expect(plan.actions[0].type).not.toBe("conflict");
    await applyPlan(plan, "copy");
    expect(readFileSync(join(dest, "skill.md"), "utf-8")).toBe("# from repo");
  });

  it("an unmodified previous sync is a clean update, not a conflict", async () => {
    writeSkill("my-skill", { "skill.md": "v1" });
    let [skill] = await scanSkills(repo);
    await applyPlan(planSync([skill], [target()], {}), "copy");
    const synced = { "my-skill": { claude: skill.hash } };
    writeFileSync(join(skill.path, "skill.md"), "v2");
    [skill] = await scanSkills(repo);
    const plan = planSync([skill], [target()], synced);
    expect(plan.actions[0].type).toBe("update");
    await applyPlan(plan, "copy");
    expect(existsSync(join(targetDir, "my-skill", "skill.md"))).toBe(true);
    expect(readFileSync(join(targetDir, "my-skill", "skill.md"), "utf-8")).toBe(
      "v2",
    );
  });

  it("a link pointing at the source is not a conflict", async () => {
    writeSkill("my-skill", { "skill.md": "v1" });
    const [skill] = await scanSkills(repo);
    symlinkSync(skill.path, join(targetDir, "my-skill"));
    const plan = planSync([skill], [target()], {});
    expect(plan.actions[0].type).toBe("create");
  });
});
