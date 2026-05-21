# Contributing to skillsync

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/nadimtuhin/skillsync.git
cd skillsync

# Install dependencies
bun install

# Run tests
bunx vitest run

# Run the CLI
bun run src/cli.ts --help
```

## Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `bunx vitest run`
4. Commit with a clear message: `git commit -m "feat: add your feature"`
5. Push and open a Pull Request

## Code Style

- Use TypeScript with strict mode enabled
- Follow the existing code patterns
- Add tests for new features
- Keep functions focused and small

## Testing

All tests must pass before submitting a PR:

```bash
bunx vitest run
```

## Reporting Issues

Use GitHub Issues to report bugs or suggest features. Include:
- Clear description of the problem
- Steps to reproduce (for bugs)
- Expected vs. actual behavior
- Environment details (OS, Node/Bun version)
