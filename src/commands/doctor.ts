import { Command } from 'commander';
import { ALL_ADAPTERS } from '../adapters/index.js';
import { getSkillsyncDir, getRepoPath } from '../core/config.js';
import { existsSync } from 'node:fs';
import { print, setJsonMode, printJson } from '../ui/output.js';
import { printTable } from '../ui/table.js';

export function registerDoctor(program: Command): void {
  program
    .command('doctor')
    .description('Check environment, detect installed tools, and report issues')
    .option('--json', 'Machine-readable output')
    .action(async (opts) => {
      if (opts.json) setJsonMode(true);

      const checks: { tool: string; detected: string; paths: string; symlinks: string }[] = [];

      for (const adapter of ALL_ADAPTERS) {
        const detected = await adapter.detect();
        checks.push({
          tool: adapter.name,
          detected: detected ? 'yes' : 'no',
          paths: adapter.getPaths().join(', '),
          symlinks: adapter.supportsLink() ? 'yes' : 'no',
        });
      }

      const repoExists = existsSync(getRepoPath());

      if (opts.json) {
        printJson({ skillsyncDir: getSkillsyncDir(), repoExists, tools: checks });
        return;
      }

      print(`skillsync dir: ${getSkillsyncDir()} (${existsSync(getSkillsyncDir()) ? 'ok' : 'missing — run init'})`);
      print(`skills repo: ${getRepoPath()} (${repoExists ? 'ok' : 'missing — run init'})\n`);

      printTable(
        [
          { header: 'Tool', key: 'tool', width: 16 },
          { header: 'Detected', key: 'detected', width: 8 },
          { header: 'Supports symlink', key: 'symlinks', width: 16 },
          { header: 'Sync paths', key: 'paths' },
        ],
        checks,
      );
    });
}
