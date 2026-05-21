import { Command } from 'commander';
import { loadConfig } from '../core/config.js';
import { scanSkills } from '../core/skill.js';
import { print, setJsonMode, printJson } from '../ui/output.js';
import { printTable } from '../ui/table.js';

export function registerList(program: Command): void {
  program
    .command('list')
    .description('Show all skills in the central repository')
    .option('--json', 'Machine-readable output')
    .action(async (opts) => {
      if (opts.json) setJsonMode(true);

      const config = loadConfig();
      const skills = await scanSkills(config.repoPath);

      if (opts.json) {
        printJson(skills);
        return;
      }

      if (skills.length === 0) {
        print('No skills found. Run `skillsync import` or add skills to ' + config.repoPath);
        return;
      }

      printTable(
        [
          { header: 'ID', key: 'id', width: 24 },
          { header: 'Hash (short)', key: 'hash', width: 12 },
          { header: 'Path', key: 'path' },
        ],
        skills.map(s => ({ id: s.id, hash: s.hash.slice(0, 8), path: s.path })),
      );
    });
}
