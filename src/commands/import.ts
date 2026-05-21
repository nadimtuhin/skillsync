import { Command } from 'commander';
import { cpSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { loadConfig } from '../core/config.js';
import { getAdapter, ALL_ADAPTERS } from '../adapters/index.js';
import { print, setJsonMode, printJson, printError } from '../ui/output.js';

export function registerImport(program: Command): void {
  program
    .command('import')
    .description('Import skills from a tool\'s directory into the central repo')
    .option('--from <target>', 'Import from a specific tool (e.g. claude)')
    .option('--dry-run', 'Show what would be imported without copying')
    .option('--json', 'Machine-readable output')
    .action(async (opts) => {
      if (opts.json) setJsonMode(true);

      const config = loadConfig();
      const adapters = opts.from ? [getAdapter(opts.from)].filter(Boolean) : ALL_ADAPTERS;

      if (opts.from && !getAdapter(opts.from)) {
        printError(`Unknown target: ${opts.from}`);
        process.exit(1);
      }

      const imported: { id: string; from: string }[] = [];

      for (const adapter of adapters) {
        if (!adapter) continue;
        const detected = await adapter.detect();
        if (!detected) continue;

        for (const sourcePath of adapter.getPaths()) {
          if (!existsSync(sourcePath)) continue;

          for (const entry of readdirSync(sourcePath)) {
            const entryPath = join(sourcePath, entry);
            if (!statSync(entryPath).isDirectory()) continue;

            const destPath = join(config.repoPath, entry);
            if (!existsSync(destPath)) {
              if (!opts.dryRun) {
                mkdirSync(config.repoPath, { recursive: true });
                cpSync(entryPath, destPath, { recursive: true });
              }
              imported.push({ id: entry, from: adapter.id });
            }
          }
        }
      }

      if (opts.json) {
        printJson({ imported, dryRun: !!opts.dryRun });
        return;
      }

      if (imported.length === 0) {
        print('Nothing to import.');
        return;
      }

      for (const { id, from } of imported) {
        print(`${opts.dryRun ? '[dry-run] ' : ''}Imported: ${id} (from ${from})`);
      }
    });
}
