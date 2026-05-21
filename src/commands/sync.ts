import { Command } from 'commander';
import { loadConfig } from '../core/config.js';
import { scanSkills } from '../core/skill.js';
import { loadState, saveState, recordSync } from '../core/registry.js';
import { planSync, applyPlan } from '../core/sync.js';
import { ALL_ADAPTERS } from '../adapters/index.js';
import { print, setJsonMode, printJson, printError } from '../ui/output.js';
import type { SyncMode, Target } from '../types/index.js';

export function registerSync(program: Command): void {
  program
    .command('sync')
    .description('Sync skills to agent tool directories')
    .option('--all', 'Sync to all detected targets')
    .option('--target <id>', 'Sync to a specific target')
    .option('--mode <mode>', 'copy or link (default: from config)')
    .option('--dry-run', 'Show plan without writing files')
    .option('--force', 'Overwrite conflicts without prompting')
    .option('--json', 'Machine-readable output')
    .action(async (opts) => {
      if (opts.json) setJsonMode(true);

      const config = loadConfig();
      const mode: SyncMode = (opts.mode as SyncMode) ?? config.defaultMode;
      const skills = await scanSkills(config.repoPath);
      const state = loadState();

      const targets: Target[] = [];
      for (const adapter of ALL_ADAPTERS) {
        if (opts.target && adapter.id !== opts.target) continue;
        const detected = await adapter.detect();
        if (!detected && !opts.all) continue;
        for (const p of adapter.getPaths()) {
          targets.push({
            id: adapter.id,
            name: adapter.name,
            paths: [p],
            supportsLink: adapter.supportsLink(),
            detected,
          });
        }
      }

      if (targets.length === 0) {
        printError('No targets detected. Run `skillsync doctor` to diagnose.');
        process.exit(1);
      }

      const plan = planSync(skills, targets, state.syncedHashes);
      plan.dryRun = !!opts.dryRun;

      const summary = {
        create: plan.actions.filter(a => a.type === 'create').length,
        update: plan.actions.filter(a => a.type === 'update').length,
        skip: plan.actions.filter(a => a.type === 'skip').length,
        dryRun: plan.dryRun,
      };

      if (opts.json) {
        printJson({ summary, actions: plan.actions });
        if (plan.dryRun) return;
      } else {
        print(`Plan: ${summary.create} create, ${summary.update} update, ${summary.skip} skip`);
        if (plan.dryRun) { print('Dry run — no files written.'); return; }
      }

      await applyPlan(plan, mode);

      let newState = state;
      for (const action of plan.actions) {
        if (action.type === 'skip') continue;
        const skill = skills.find(s => s.id === action.skillId);
        if (skill) newState = recordSync(newState, skill.id, action.targetId, skill.hash);
      }
      saveState(newState);

      print(`Done. Synced ${summary.create + summary.update} skill(s) in ${mode} mode.`);
    });
}
