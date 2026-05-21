import { existsSync, mkdirSync, rmSync } from "node:fs";
import * as os from "node:os";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const testHome = join(tmpdir(), `skillsync-test-${Date.now()}`);

// Mock homedir before importing modules
vi.spyOn(os, "homedir").mockReturnValue(testHome);

import {
  getConfigPath,
  getRepoPath,
  loadConfig,
  saveConfig,
} from "../../src/core/config";

describe("config", () => {
  beforeEach(() =>
    mkdirSync(join(testHome, ".skillsync"), { recursive: true }),
  );
  afterEach(() => rmSync(testHome, { recursive: true, force: true }));

  it("returns default config when none exists", () => {
    const config = loadConfig();
    expect(config.defaultMode).toBe("copy");
    expect(config.targets).toEqual([]);
    expect(config.ignorePatterns).toEqual([]);
  });

  it("saves and reloads config", () => {
    const cfg = {
      repoPath: join(testHome, ".skillsync", "skills"),
      defaultMode: "link" as const,
      targets: [],
      ignorePatterns: [],
    };
    saveConfig(cfg);
    const loaded = loadConfig();
    expect(loaded.defaultMode).toBe("link");
  });

  it("getConfigPath returns ~/.skillsync/config.json", () => {
    expect(getConfigPath()).toBe(join(testHome, ".skillsync", "config.json"));
  });

  it("getRepoPath returns ~/.skillsync/skills", () => {
    expect(getRepoPath()).toBe(join(testHome, ".skillsync", "skills"));
  });
});
