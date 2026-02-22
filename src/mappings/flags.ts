import type { FlagMapping, PackageManager } from '../types';

export const FLAG_MAPPINGS: Record<string, FlagMapping> = {
  save: {
    npm: '--save',
    yarn: '',
    pnpm: '',
    bun: '',
    description: 'Save to dependencies (default)',
  },
  'save-dev': {
    npm: '--save-dev',
    yarn: '--dev',
    pnpm: '--save-dev',
    bun: '--dev',
    description: 'Save as dev dependency',
  },
  D: {
    npm: '-D',
    yarn: '-D',
    pnpm: '-D',
    bun: '-D',
    description: 'Save as dev dependency (shorthand)',
  },
  'save-optional': {
    npm: '--save-optional',
    yarn: '--optional',
    pnpm: '--save-optional',
    bun: '--optional',
    description: 'Save as optional dependency',
  },
  O: {
    npm: '-O',
    yarn: '--optional',
    pnpm: '-O',
    bun: '--optional',
    description: 'Save as optional dependency (shorthand)',
  },
  'save-exact': {
    npm: '--save-exact',
    yarn: '--exact',
    pnpm: '--save-exact',
    bun: '--exact',
    description: 'Save with exact version',
  },
  E: {
    npm: '-E',
    yarn: '--exact',
    pnpm: '-E',
    bun: '--exact',
    description: 'Save with exact version (shorthand)',
  },
  'save-peer': {
    npm: '--save-peer',
    yarn: '--peer',
    pnpm: '--save-peer',
    bun: '',
    description: 'Save as peer dependency (not supported in bun)',
  },
  global: {
    npm: '--global',
    yarn: 'global',
    pnpm: '--global',
    bun: '--global',
    description: 'Operate globally',
  },
  g: {
    npm: '-g',
    yarn: 'global',
    pnpm: '-g',
    bun: '-g',
    description: 'Operate globally (shorthand)',
  },
  force: {
    npm: '--force',
    yarn: '--force',
    pnpm: '--force',
    bun: '--force',
    description: 'Force operation',
  },
  'frozen-lockfile': {
    npm: '--frozen-lockfile',
    yarn: '--frozen-lockfile',
    pnpm: '--frozen-lockfile',
    bun: '--frozen-lockfile',
    description: 'Install from lockfile only',
  },
  production: {
    npm: '--production',
    yarn: '--production',
    pnpm: '--production',
    bun: '--production',
    description: 'Install production deps only',
  },
  dev: {
    npm: '--include=dev',
    yarn: '--dev',
    pnpm: '--dev',
    bun: '--dev',
    description: 'Include dev dependencies',
  },
  optional: {
    npm: '--include=optional',
    yarn: '--optional',
    pnpm: '--optional',
    bun: '--optional',
    description: 'Include optional dependencies',
  },
  'no-optional': {
    npm: '--omit=optional',
    yarn: '--no-optional',
    pnpm: '--no-optional',
    bun: '--no-optional',
    description: 'Omit optional dependencies',
  },
  verbose: {
    npm: '--verbose',
    yarn: '--verbose',
    pnpm: '--verbose',
    bun: '--verbose',
    description: 'Verbose output',
  },
  quiet: {
    npm: '--quiet',
    yarn: '--silent',
    pnpm: '--silent',
    bun: '--silent',
    description: 'Quiet output',
  },
  silent: {
    npm: '--silent',
    yarn: '--silent',
    pnpm: '--silent',
    bun: '--silent',
    description: 'Silent output',
  },
  'no-save': {
    npm: '--no-save',
    yarn: '--no-save',
    pnpm: '--no-save',
    bun: '--no-save',
    description: 'Do not save to package.json',
  },
  legacyPeerDeps: {
    npm: '--legacy-peer-deps',
    yarn: '--ignore-peer-dependencies',
    pnpm: '--ignore-peer-dependencies',
    bun: '',
    description: 'Ignore peer dependencies',
  },
  ignoreScripts: {
    npm: '--ignore-scripts',
    yarn: '--ignore-scripts',
    pnpm: '--ignore-scripts',
    bun: '--ignore-scripts',
    description: 'Skip scripts',
  },
  workspace: {
    npm: '--workspace',
    yarn: '--workspace',
    pnpm: '--filter',
    bun: '--filter',
    description: 'Workspace filter',
  },
};

export const SHORTHAND_FLAGS: Record<string, { full: string; value: boolean | string }> = {
  '-D': { full: 'save-dev', value: true },
  '-g': { full: 'global', value: true },
  '-O': { full: 'save-optional', value: true },
  '-E': { full: 'save-exact', value: true },
  '-P': { full: 'save-prod', value: true },
};

export function getFlagMapping(flag: string, target: PackageManager): string | undefined {
  const cleanFlag = flag.replace(/^-+/, '');
  const mapping = FLAG_MAPPINGS[cleanFlag];
  if (!mapping) return undefined;
  return mapping[target];
}

export function normalizeFlag(flag: string): string {
  const cleanFlag = flag.replace(/^-+/, '');
  if (SHORTHAND_FLAGS[`-${cleanFlag}`]) {
    return SHORTHAND_FLAGS[`-${cleanFlag}`].full;
  }
  return cleanFlag;
}
