export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export interface ParsedCommand {
  manager: PackageManager;
  command: string;
  packages: string[];
  flags: Record<string, string | boolean>;
  raw: string;
  isGlobal: boolean;
  isDev: boolean;
  isOptional: boolean;
  isExact: boolean;
  isPeer: boolean;
}

export interface ConversionResult {
  command: string;
  warnings?: string[];
}

export interface CommandMapping {
  npm?: string;
  yarn?: string;
  pnpm?: string;
  bun?: string;
  description?: string;
}

export interface FlagMapping {
  npm?: string;
  yarn?: string;
  pnpm?: string;
  bun?: string;
  description?: string;
}

export const LOCKFILE_PRIORITY: Array<{ file: string; manager: PackageManager }> = [
  { file: 'pnpm-lock.yaml', manager: 'pnpm' },
  { file: 'yarn.lock', manager: 'yarn' },
  { file: 'bun.lock', manager: 'bun' },
  { file: 'bun.lockb', manager: 'bun' },
  { file: 'package-lock.json', manager: 'npm' },
];

export const PACKAGE_MANAGERS: PackageManager[] = ['npm', 'yarn', 'pnpm', 'bun'];
