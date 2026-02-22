import type { CommandMapping, PackageManager } from '../types';

export const COMMAND_MAPPINGS: Record<string, CommandMapping> = {
  install: {
    npm: 'install',
    yarn: 'install',
    pnpm: 'install',
    bun: 'install',
    description: 'Install all dependencies',
  },
  i: {
    npm: 'install',
    yarn: 'add',
    pnpm: 'add',
    bun: 'add',
    description: 'Install packages',
  },
  add: {
    npm: 'install',
    yarn: 'add',
    pnpm: 'add',
    bun: 'add',
    description: 'Add packages',
  },
  installDev: {
    npm: 'install -D',
    yarn: 'add -D',
    pnpm: 'add -D',
    bun: 'add -D',
    description: 'Install as dev dependency',
  },
  uninstall: {
    npm: 'uninstall',
    yarn: 'remove',
    pnpm: 'remove',
    bun: 'remove',
    description: 'Remove packages',
  },
  remove: {
    npm: 'uninstall',
    yarn: 'remove',
    pnpm: 'remove',
    bun: 'remove',
    description: 'Remove packages',
  },
  rm: {
    npm: 'uninstall',
    yarn: 'remove',
    pnpm: 'remove',
    bun: 'remove',
    description: 'Remove packages (shorthand)',
  },
  update: {
    npm: 'update',
    yarn: 'upgrade',
    pnpm: 'update',
    bun: 'update',
    description: 'Update packages',
  },
  upgrade: {
    npm: 'update',
    yarn: 'upgrade',
    pnpm: 'update',
    bun: 'update',
    description: 'Upgrade packages',
  },
  run: {
    npm: 'run',
    yarn: 'run',
    pnpm: 'run',
    bun: 'run',
    description: 'Run a script',
  },
  exec: {
    npm: 'exec',
    yarn: 'exec',
    pnpm: 'exec',
    bun: 'run',
    description: 'Execute a command',
  },
  npx: {
    npm: 'npx',
    yarn: 'yarn dlx',
    pnpm: 'pnpm dlx',
    bun: 'bunx',
    description: 'Run a package binary',
  },
  dlx: {
    npm: 'npx',
    yarn: 'yarn dlx',
    pnpm: 'pnpm dlx',
    bun: 'bunx',
    description: 'Run a package binary (download)',
  },
  bunx: {
    npm: 'npx',
    yarn: 'yarn dlx',
    pnpm: 'pnpm dlx',
    bun: 'bunx',
    description: 'Run a package binary (bun)',
  },
  init: {
    npm: 'init',
    yarn: 'init',
    pnpm: 'init',
    bun: 'init',
    description: 'Initialize a new project',
  },
  create: {
    npm: 'create',
    yarn: 'create',
    pnpm: 'create',
    bun: 'create',
    description: 'Create a new project from template',
  },
  ci: {
    npm: 'ci',
    yarn: 'install --frozen-lockfile',
    pnpm: 'install --frozen-lockfile',
    bun: 'install --frozen-lockfile',
    description: 'Clean install from lockfile',
  },
  audit: {
    npm: 'audit',
    yarn: 'npm audit',
    pnpm: 'audit',
    bun: 'npm audit',
    description: 'Check for vulnerabilities',
  },
  outdated: {
    npm: 'outdated',
    yarn: 'outdated',
    pnpm: 'outdated',
    bun: 'npm outdated',
    description: 'Check for outdated packages',
  },
  cacheClean: {
    npm: 'cache clean',
    yarn: 'cache clean',
    pnpm: 'store prune',
    bun: 'npm cache clean',
    description: 'Clean package cache',
  },
  link: {
    npm: 'link',
    yarn: 'link',
    pnpm: 'link',
    bun: 'link',
    description: 'Link a package locally',
  },
  unlink: {
    npm: 'unlink',
    yarn: 'unlink',
    pnpm: 'unlink',
    bun: 'unlink',
    description: 'Unlink a local package',
  },
  list: {
    npm: 'list',
    yarn: 'list',
    pnpm: 'list',
    bun: 'pm ls',
    description: 'List installed packages',
  },
  ls: {
    npm: 'list',
    yarn: 'list',
    pnpm: 'list',
    bun: 'pm ls',
    description: 'List installed packages (shorthand)',
  },
  info: {
    npm: 'info',
    yarn: 'info',
    pnpm: 'info',
    bun: 'info',
    description: 'Show package info',
  },
  why: {
    npm: 'why',
    yarn: 'why',
    pnpm: 'why',
    bun: 'pm ls',
    description: 'Show why a package is installed',
  },
  pack: {
    npm: 'pack',
    yarn: 'pack',
    pnpm: 'pack',
    bun: 'pack',
    description: 'Create a tarball from a package',
  },
  publish: {
    npm: 'publish',
    yarn: 'publish',
    pnpm: 'publish',
    bun: 'publish',
    description: 'Publish a package',
  },
  version: {
    npm: 'version',
    yarn: 'version',
    pnpm: 'version',
    bun: 'version',
    description: 'Bump package version',
  },
};

export function getCommandMapping(command: string, target: PackageManager): string | undefined {
  const mapping = COMMAND_MAPPINGS[command];
  if (!mapping) return undefined;
  return mapping[target];
}

export function normalizeCommand(manager: PackageManager, command: string): string {
  const mappings: Record<string, Record<string, string>> = {
    npm: { i: 'add', install: 'add', uninstall: 'remove', rm: 'remove' },
    yarn: { install: 'add', uninstall: 'remove', rm: 'remove' },
    pnpm: { i: 'add', install: 'add', uninstall: 'remove', rm: 'remove' },
    bun: { i: 'add', install: 'add', uninstall: 'remove', rm: 'remove' },
  };
  
  return mappings[manager]?.[command] || command;
}
