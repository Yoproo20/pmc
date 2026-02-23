#!/usr/bin/env node
import { parseArgs } from 'util';
import type { PackageManager } from './types';
import { PACKAGE_MANAGERS } from './types';
import { detectPackageManager } from './detector';
import { parseCommand } from './parser';
import { convertCommand } from './converter';

function printUsage(): void {
  console.log(`
pmc - Package Manager Converter

Usage:
  pmc <target> [command]     Convert command to target package manager
  pmc all <command>          Convert command to all other package managers
  pmc <target>               Show install command for target (auto-detected source)

Arguments:
  <target>     Target package manager (npm, yarn, pnpm, bun, all)
  [command]    Command to convert (if omitted, shows install command)

Options:
  -h, --help   Show this help message

Examples:
  pmc bun "npm install lodash -D"
  pmc pnpm "yarn add react react-dom"
  pmc all "npm install lodash"    # Shows yarn, pnpm, bun versions
  pmc bun                    # Auto-detect source, show "bun install"
  pmc yarn "pnpm add -g pkg" # Convert global install
`);
}

function isValidPackageManager(value: string): value is PackageManager {
  return PACKAGE_MANAGERS.includes(value as PackageManager);
}

function isAllCommand(value: string): boolean {
  return value === 'all';
}

function main(): void {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      help: {
        type: 'boolean',
        short: 'h',
      },
    },
    strict: false,
  });

  if (values.help) {
    printUsage();
    process.exit(0);
  }

  if (positionals.length === 0) {
    console.error('Error: Missing target package manager');
    console.error('Usage: pmc <target> [command]');
    process.exit(1);
  }

  const target = positionals[0];
  const isAll = isAllCommand(target);

  if (!isAll && !isValidPackageManager(target)) {
    console.error(`Error: Invalid package manager "${target}"`);
    console.error(`Valid options: ${PACKAGE_MANAGERS.join(', ')}, all`);
    process.exit(1);
  }

  const commandString = positionals.slice(1).join(' ').trim();

  if (!commandString) {
    if (isAll) {
      console.error('Error: Command required when using "all"');
      process.exit(1);
    }
    const detected = detectPackageManager();
    const sourceManager = detected || 'npm';
    console.log(`${target} install`);
    return;
  }

  const parsed = parseCommand(commandString);

  if (!parsed) {
    console.error(`Error: Could not parse command "${commandString}"`);
    process.exit(1);
  }

  if (isAll) {
    const sourceManager = parsed.manager;
    const otherManagers = PACKAGE_MANAGERS.filter(m => m !== sourceManager);

    for (const manager of otherManagers) {
      const result = convertCommand(parsed, manager);
      console.log(result.command);
    }
  } else {
    const result = convertCommand(parsed, target as PackageManager);

    console.log(result.command);

    if (result.warnings && result.warnings.length > 0) {
      for (const warning of result.warnings) {
        console.error(`Warning: ${warning}`);
      }
    }
  }
}

main();
