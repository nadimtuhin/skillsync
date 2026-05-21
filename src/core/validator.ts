import { existsSync, readdirSync } from "node:fs";
import type { Skill, ValidationResult } from "../types/index.js";

const KEBAB_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function validateSkill(skill: Skill): ValidationResult {
  const errors: string[] = [];

  if (!KEBAB_RE.test(skill.id)) {
    errors.push(`id must be kebab-case (got "${skill.id}")`);
  }

  if (!existsSync(skill.path)) {
    errors.push(`path does not exist: ${skill.path}`);
    return { valid: false, errors };
  }

  const files = readdirSync(skill.path);
  const mdFiles = files.filter((f) => f.endsWith(".md"));
  if (mdFiles.length === 0) {
    errors.push("no .md files found in skill directory");
  }

  return { valid: errors.length === 0, errors };
}
