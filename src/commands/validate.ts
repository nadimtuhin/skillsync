import { Command } from 'commander';
import { loadConfig } from '../core/config.js';
import { scanSkills } from '../core/skill.js';
import { validateSkill } from '../core/validator.js';
import { print, setJsonMode, printJson, exitErr } from '../ui/output.js';

export function registerValidate(program: Command): void {
  program
    .command('validate')
    .description('Check all skills for structural issues')
    .option('--json', 'Machine-readable output')
    .action(async (opts) => {
      if (opts.json) setJsonMode(true);

      const config = loadConfig();
      const skills = await scanSkills(config.repoPath);
      const results = skills.map(s => ({ skill: s, result: validateSkill(s) }));
      const invalid = results.filter(r => !r.result.valid);

      if (opts.json) {
        printJson(results.map(r => ({ id: r.skill.id, ...r.result })));
        return;
      }

      if (invalid.length === 0) {
        print(`All ${skills.length} skills are valid.`);
        return;
      }

      for (const { skill, result } of invalid) {
        print(`\n[FAIL] ${skill.id}`);
        for (const err of result.errors) print(`  - ${err}`);
      }
      exitErr(`\n${invalid.length} skill(s) failed validation.`);
    });
}
