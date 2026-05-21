import { describe, expect, it } from "vitest";
import {
  getConfigPath,
  getRepoPath,
  getSkillsyncDir,
} from "../../src/core/config";

describe("config", () => {
  it("getSkillsyncDir returns ~/.skillsync path", () => {
    const path = getSkillsyncDir();
    expect(path).toMatch(/\.skillsync$/);
  });

  it("getConfigPath returns config.json path", () => {
    const path = getConfigPath();
    expect(path).toMatch(/\.skillsync[/\\]config\.json$/);
  });

  it("getRepoPath returns skills dir path", () => {
    const path = getRepoPath();
    expect(path).toMatch(/\.skillsync[/\\]skills$/);
  });
});
