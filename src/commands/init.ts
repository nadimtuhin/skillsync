import { mkdirSync, existsSync } from 'node:fs';
import { Command } from 'commander';
import { getSkillsyncDir, getRepoPath, loadConfig, saveConfig } from '../core/config.js';
import { print, setJsonMode, printJson } from '../ui/output.js';

export function registerInit(program: Command): void {
  program
    .command('init')
    .description('Create central skillsync config and skills repository')
    .option('--json', 'Machine-readable output')
    .action((opts) => {
      if (opts.json) setJsonMode(true);

      const dir = getSkillsyncDir();
      const repoPath = getRepoPath();

      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      if (!existsSync(repoPath)) mkdirSync(repoPath, { recursive: true });

      const config = loadConfig();
      saveConfig(config);

      if (opts.json) {
        printJson({ status: 'ok', dir, repoPath });
      } else {
        print(`Initialized skillsync at ${dir}`);
        print(`Skills repo: ${repoPath}`);
      }
    });
}
