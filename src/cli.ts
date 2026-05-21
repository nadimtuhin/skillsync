#!/usr/bin/env bun
// src/cli.ts
import { Command } from 'commander';
import { registerInit } from './commands/init.js';
import { registerDoctor } from './commands/doctor.js';
import { registerList } from './commands/list.js';
import { registerValidate } from './commands/validate.js';
import { registerSync } from './commands/sync.js';
import { registerImport } from './commands/import.js';
import { registerTarget } from './commands/target.js';

const program = new Command();

program
  .name('skillsync')
  .description('Sync AI agent skills across multiple tools from one canonical repo')
  .version('0.1.0');

registerInit(program);
registerDoctor(program);
registerList(program);
registerValidate(program);
registerSync(program);
registerImport(program);
registerTarget(program);

program.parse();
