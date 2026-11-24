import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const CLI = resolve("src/cli.ts");
const home = join(tmpdir(), `skillsync cli ${process.pid}-${Date.now()}`);
const repoSkill = join(home, ".skillsync", "skills", "my-skill");
const dest = join(home, ".claude", "skills", "my-skill");

function run(...args: string[]) {
  return spawnSync("bun", [CLI, ...args], {
    env: { ...process.env, HOME: home, USERPROFILE: home },
    encoding: "utf-8",
  });
}

beforeEach(() => {
  mkdirSync(repoSkill, { recursive: true });
  writeFileSync(join(repoSkill, "skill.md"), "# from repo");
  mkdirSync(dest, { recursive: true });
  writeFileSync(join(dest, "skill.md"), "# user's own");
});
afterEach(() => rmSync(home, { recursive: true, force: true }));

describe("skillsync sync (cli)", () => {
  it("reports conflicts, leaves them untouched and does not record them", () => {
    const res = run("sync", "--target", "claude", "--json");
    const out = JSON.parse(res.stdout);
    expect(out.summary.conflict).toBe(1);
    expect(res.status).not.toBe(0);
    expect(readFileSync(join(dest, "skill.md"), "utf-8")).toBe("# user's own");
    const state = JSON.parse(
      readFileSync(join(home, ".skillsync", "state.json"), "utf-8"),
    );
    expect(state.syncedHashes["my-skill"]).toBeUndefined();
  });

  it("--force overwrites the conflicting destination", () => {
    const res = run("sync", "--target", "claude", "--force");
    expect(res.status).toBe(0);
    expect(readFileSync(join(dest, "skill.md"), "utf-8")).toBe("# from repo");
  });
});
