# AGENTS.md

Guidelines for AI coding agents working in this repository.

## Project Overview

`pmc` (Package Manager Converter) is a CLI tool that converts package manager commands between npm, yarn, pnpm, and bun. Built with Bun + TypeScript, it provides both a CLI interface and a programmatic API.

## Build/Lint/Test Commands

```bash
# Build the project
bun run build

# Type checking (run before committing)
bun run typecheck

# Development mode with watch
bun run dev

# Quick benchmark (timing only)
bun run bench:quick

# Detailed benchmark (mitata)
bun run bench

# Test a single conversion manually
bun run src/cli.ts bun "npm install lodash -D"

# Publish (runs prepublishOnly automatically)
npm publish
```

## Project Structure

```
pmc/
├── src/
│   ├── index.ts          # Public exports - re-exports from other modules
│   ├── types.ts          # Core types: PackageManager, ParsedCommand, ConversionResult
│   ├── parser.ts         # Command string parsing logic
│   ├── converter.ts      # Main conversion logic
│   ├── detector.ts       # Lockfile detection
│   ├── cli.ts            # CLI entry point
│   └── mappings/
│       ├── index.ts      # Re-exports commands and flags
│       ├── commands.ts   # Command equivalence mappings
│       └── flags.ts      # Flag equivalence mappings
├── bench/
│   ├── index.ts          # Mitata benchmark suite
│   └── quick.ts          # Simple timing benchmark
└── dist/                 # Built output (generated)
```

## Code Style Guidelines

### Imports

- Use `import type` for type-only imports:
  ```typescript
  import type { PackageManager, ParsedCommand } from './types';
  ```
- Group imports: external → internal types → internal modules
- Use relative imports for internal modules (no path aliases)

### Formatting

- 2-space indentation
- Single quotes for strings
- No trailing commas in objects/arrays
- Blank line before `return` statements
- Blank line between logical sections

### Types

- Prefer `interface` for object shapes:
  ```typescript
  export interface ParsedCommand {
    manager: PackageManager;
    command: string;
    packages: string[];
    // ...
  }
  ```
- Use `type` for unions and primitives:
  ```typescript
  export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
  ```
- Use `Record<string, T>` for dictionaries:
  ```typescript
  const COMMAND_ALIASES: Record<string, string> = { ... };
  ```
- Explicit return types on exported functions

### Naming Conventions

- `camelCase` for variables, functions, methods
- `PascalCase` for types, interfaces, classes
- `SCREAMING_SNAKE_CASE` for top-level constants used as lookup tables:
  ```typescript
  export const COMMAND_MAPPINGS: Record<string, CommandMapping> = { ... };
  export const PACKAGE_MANAGERS: PackageManager[] = [...];
  ```
- Descriptive boolean names: `isGlobal`, `isDev`, `isOptional`, `isExact`, `isPeer`

### Functions

- Small, focused functions (under 50 lines when possible)
- Helper functions at top of file, exported functions at bottom
- Use early returns to reduce nesting:
  ```typescript
  if (!trimmed) return null;
  ```
- Avoid unnecessary else clauses

### Error Handling

- Return `null` for parse failures rather than throwing:
  ```typescript
  export function parseCommand(commandString: string): ParsedCommand | null {
    if (!trimmed) return null;
    // ...
  }
  ```
- Use warnings array for non-fatal issues:
  ```typescript
  interface ConversionResult {
    command: string;
    warnings?: string[];
  }
  ```
- CLI exits with code 1 on errors, 0 on success
- Print errors to stderr, output to stdout

### Constants

- Define lookup tables and mappings as top-level `const` objects
- Group related constants together
- Document with `description` field in mapping objects

### Exports

- Use named exports (no default exports)
- Re-export public API from `src/index.ts`:
  ```typescript
  export type { PackageManager, ParsedCommand } from './types';
  export { parseCommand } from './parser';
  ```
- Keep internal helpers unexported

## Architecture Notes

- **Core library is web-ready**: Logic in `parser.ts`, `converter.ts`, `detector.ts` has no CLI dependencies
- **CLI is a thin wrapper**: `cli.ts` only handles argument parsing and I/O
- **Mappings are data-driven**: Command/flag equivalences live in data tables, not hardcoded logic
- **Warn-and-continue**: Unknown commands/flags generate warnings but don't fail conversion

## Supported Package Managers

| Manager | Notes |
|---------|-------|
| npm | Baseline |
| yarn | Uses `global` prefix instead of `-g` flag |
| pnpm | Uses `dlx` for npx equivalent |
| bun | No `--save-peer` support, uses `bunx` for npx |

## Lockfile Detection Priority

1. `pnpm-lock.yaml` → pnpm
2. `yarn.lock` → yarn
3. `bun.lock` / `bun.lockb` → bun
4. `package-lock.json` → npm

## When Adding New Commands

1. Add mapping to `COMMAND_MAPPINGS` in `src/mappings/commands.ts`
2. Add any new flags to `FLAG_MAPPINGS` in `src/mappings/flags.ts`
3. Update parser if command has special syntax
4. Add test cases to benchmarks or manual testing
5. Update README.md command table
