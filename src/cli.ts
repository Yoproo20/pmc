#!/usr/bin/env bun
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
  pmc <target>               Show install command for target (auto-detected source)

Arguments:
  <target>     Target package manager (npm, yarn, pnpm, bun)
  [command]    Command to convert (if omitted, shows install command)

Options:
  -h, --help   Show this help message

Examples:
  pmc bun "npm install lodash -D"
  pmc pnpm "yarn add react react-dom"
  pmc bun                    # Auto-detect source, show "bun install"
  pmc yarn "pnpm add -g pkg" # Convert global install
`);
}

function isValidPackageManager(value: string): value is PackageManager {
  return PACKAGE_MANAGERS.includes(value as PackageManager);
}

function main(): void {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
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
  
  if (!isValidPackageManager(target)) {
    console.error(`Error: Invalid package manager "${target}"`);
    console.error(`Valid options: ${PACKAGE_MANAGERS.join(', ')}`);
    process.exit(1);
  }

  const commandString = positionals.slice(1).join(' ').trim();

  if (!commandString) {
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

  const result = convertCommand(parsed, target);
  
  console.log(result.command);
  
  if (result.warnings && result.warnings.length > 0) {
    for (const warning of result.warnings) {
      console.error(`Warning: ${warning}`);
    }
  }
}

main();
