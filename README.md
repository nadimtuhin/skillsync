# skillsync

[![CI](https://github.com/nadimtuhin/skillsync/workflows/CI/badge.svg)](https://github.com/nadimtuhin/skillsync/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Sync AI agent skills across multiple tools from one canonical repository.

Write your skills once, deploy them everywhere — Claude Code, Cursor, and more.

## Install

```bash
# Clone and build
git clone https://github.com/nadimtuhin/skillsync
cd skillsync
bun install
bun run build

# Link globally
ln -s $(pwd)/dist/cli.js /usr/local/bin/skillsync
```

Or run directly:

```bash
bun run src/cli.ts <command>
```

## Features

- 🎯 **Central repository** — Single source of truth for all agent skills
- 🔗 **Flexible sync** — Copy or symlink modes for different workflows
- 🔒 **Idempotent** — Hash-based change detection, safe to run repeatedly
- 🚀 **Zero config** — Auto-detects Claude Code, Cursor, and other tools
- 📊 **Machine-readable** — All commands support `--json` output for scripting
- 🔍 **Validation** — Built-in skill structure validation
- 📋 **Dry-run mode** — Preview changes before syncing

## Quick Start

```bash
# 1. Initialize skillsync
skillsync init

# 2. Import existing skills from detected tools
skillsync import

# 3. List skills in the central repository
skillsync list

# 4. Validate all skills
skillsync validate

# 5. Sync skills to all detected tools
skillsync sync --all
```

## Commands

| Command | Description |
|---|---|
| `init` | Create central skillsync config and skills repository |
| `doctor` | Check environment, detect installed tools, and report issues |
| `list` | Show all skills in the central repository |
| `validate` | Check all skills for structural issues |
| `sync` | Sync skills to agent tool directories |
| `import` | Import skills from a tool's directory into the central repo |
| `target list` | Show all supported agent tools and their resolved paths |

## Options Reference

### `skillsync sync`

| Option | Description |
|---|---|
| `--all` | Sync to all detected targets |
| `--target <id>` | Sync to a specific target (e.g. `claude`, `cursor`) |
| `--mode <mode>` | `copy` or `link` (default: from config) |
| `--dry-run` | Show plan without writing files |
| `--force` | Overwrite conflicts without prompting |
| `--json` | Machine-readable JSON output |

### `skillsync import`

| Option | Description |
|---|---|
| `--from <target>` | Import from a specific tool (e.g. `claude`) |
| `--dry-run` | Show what would be imported without copying |
| `--json` | Machine-readable JSON output |

### Global Options

All commands support `--json` for machine-readable output. Useful for scripting:

```bash
skillsync list --json | jq '.[].id'
skillsync doctor --json | jq '.tools[] | select(.detected == "yes")'
```

## Supported Tools

| ID | Tool | Sync Path | Symlinks |
|---|---|---|---|
| `claude` | Claude Code | `~/.claude/skills` | yes (non-Windows) |
| `cursor` | Cursor | `~/.cursor/rules` | yes (non-Windows) |

## Sync Modes

- **`copy`** (default): Files are copied to each tool's directory. Changes to the central repo require a re-sync.
- **`link`**: Symlinks are created pointing to the central repo. Changes are reflected immediately. Not supported on Windows.

Set the default mode in `~/.skillsync/config.json`:

```json
{
  "defaultMode": "link"
}
```

## Configuration

Config lives at `~/.skillsync/config.json`:

```json
{
  "repoPath": "~/.skillsync/skills",
  "defaultMode": "copy",
  "targets": [],
  "ignorePatterns": []
}
```

| Field | Description |
|---|---|
| `repoPath` | Path to the central skills repository |
| `defaultMode` | `copy` or `link` |
| `targets` | Override detected targets (leave empty to auto-detect) |
| `ignorePatterns` | Glob patterns to exclude from sync |

## Skill Structure

A skill is a directory under the skills repo. Each skill directory can contain any files your tool expects (markdown, JSON, TOML, etc.).

```
~/.skillsync/skills/
  my-coding-style/
    instructions.md
  testing-patterns/
    rules.md
  code-review/
    checklist.md
```

## Development

```bash
bun install       # Install dependencies
bun run test      # Run tests
bun run test:watch  # Watch mode
bun run lint      # Lint with Biome
bun run format    # Format with Biome
bun run build     # Build to dist/cli.js
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup guide
- How to run tests
- Code style guidelines
- Pull request process

## Code of Conduct

This project adheres to the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## License

This project is licensed under the [MIT License](LICENSE).
