import { existsSync } from 'fs';
import { resolve } from 'path';
import type { PackageManager } from './types';
import { LOCKFILE_PRIORITY } from './types';

export function detectPackageManager(cwd: string = process.cwd()): PackageManager | null {
  for (const { file, manager } of LOCKFILE_PRIORITY) {
    const lockfilePath = resolve(cwd, file);
    if (existsSync(lockfilePath)) {
      return manager;
    }
  }
  return null;
}

export function detectPackageManagerFromCommand(command: string): PackageManager | null {
  const trimmed = command.trim();
  const firstWord = trimmed.split(/\s+/)[0];
  
  if (firstWord === 'npx') return 'npm';
  if (firstWord === 'bunx') return 'bun';
  if (firstWord === 'dlx') return 'yarn';
  
  const managerPatterns: Array<{ pattern: RegExp; manager: PackageManager }> = [
    { pattern: /^npm(\s|$)/, manager: 'npm' },
    { pattern: /^yarn(\s|$)/, manager: 'yarn' },
    { pattern: /^pnpm(\s|$)/, manager: 'pnpm' },
    { pattern: /^bun(\s|$)/, manager: 'bun' },
  ];
  
  for (const { pattern, manager } of managerPatterns) {
    if (pattern.test(trimmed)) {
      return manager;
    }
  }
  
  return null;
}
