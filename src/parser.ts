import type { PackageManager, ParsedCommand } from './types';
import { SHORTHAND_FLAGS } from './mappings/flags';

const PACKAGE_MANAGER_ALIASES: Record<string, PackageManager> = {
  npm: 'npm',
  yarn: 'yarn',
  pnpm: 'pnpm',
  bun: 'bun',
  npx: 'npm',
  bunx: 'bun',
  dlx: 'yarn',
};

const SCRIPT_COMMANDS = ['run', 'run-script'];
const SPECIAL_COMMANDS = ['npx', 'bunx', 'dlx'];

function isPackage(arg: string): boolean {
  if (arg.startsWith('-')) return false;
  if (arg.startsWith('@') || !arg.includes('@')) return true;
  const atIndex = arg.indexOf('@');
  const beforeAt = arg.substring(0, atIndex);
  return beforeAt.includes('/') || atIndex > 0;
}

function parseFlags(args: string[]): { flags: Record<string, string | boolean>; remaining: string[] } {
  const flags: Record<string, string | boolean> = {};
  const remaining: string[] = [];
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--') {
      remaining.push(...args.slice(i));
      break;
    }
    
    if (arg.startsWith('--')) {
      const flagName = arg.slice(2);
      if (flagName.includes('=')) {
        const [name, value] = flagName.split('=');
        flags[name] = value;
      } else if (i + 1 < args.length && !args[i + 1].startsWith('-') && !isPackage(args[i + 1])) {
        flags[flagName] = args[i + 1];
        i++;
      } else {
        flags[flagName] = true;
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      const flagChar = arg[1];
      const shorthand = SHORTHAND_FLAGS[arg];
      if (shorthand) {
        flags[shorthand.full] = shorthand.value;
      } else {
        flags[flagChar] = true;
      }
    } else if (arg.startsWith('-') && arg.length > 2 && !arg.startsWith('--')) {
      for (let j = 1; j < arg.length; j++) {
        const flagChar = arg[j];
        const shorthand = SHORTHAND_FLAGS[`-${flagChar}`];
        if (shorthand) {
          flags[shorthand.full] = shorthand.value;
        } else {
          flags[flagChar] = true;
        }
      }
    } else {
      remaining.push(arg);
    }
  }
  
  return { flags, remaining };
}

export function parseCommand(commandString: string): ParsedCommand | null {
  const trimmed = commandString.trim();
  if (!trimmed) return null;
  
  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 0) return null;
  
  let manager: PackageManager;
  let firstToken = tokens[0];
  let commandTokens: string[];
  
  if (SPECIAL_COMMANDS.includes(firstToken)) {
    manager = PACKAGE_MANAGER_ALIASES[firstToken];
    const remaining = tokens.slice(1);
    return {
      manager,
      command: firstToken,
      packages: remaining,
      flags: {},
      raw: commandString,
      isGlobal: false,
      isDev: false,
      isOptional: false,
      isExact: false,
      isPeer: false,
    };
  }
  
  if (PACKAGE_MANAGER_ALIASES[firstToken]) {
    manager = PACKAGE_MANAGER_ALIASES[firstToken];
    commandTokens = tokens.slice(1);
  } else {
    return null;
  }
  
  if (commandTokens.length === 0) {
    return {
      manager,
      command: 'install',
      packages: [],
      flags: {},
      raw: commandString,
      isGlobal: false,
      isDev: false,
      isOptional: false,
      isExact: false,
      isPeer: false,
    };
  }
  
  let command = commandTokens[0];
  let isGlobal = false;
  let argsStart = 1;
  
  if (manager === 'yarn' && command === 'global') {
    isGlobal = true;
    command = commandTokens[1] || 'install';
    argsStart = 2;
  }
  
  if (SCRIPT_COMMANDS.includes(command)) {
    const scriptName = commandTokens[1];
    if (scriptName && !scriptName.startsWith('-')) {
      const { flags, remaining } = parseFlags(commandTokens.slice(2));
      return {
        manager,
        command: 'run',
        packages: [scriptName, ...remaining],
        flags,
        raw: commandString,
        isGlobal,
        isDev: false,
        isOptional: false,
        isExact: false,
        isPeer: false,
      };
    }
  }
  
  if (command === 'test' || command === 'start' || command === 'build') {
    const { flags } = parseFlags(commandTokens.slice(1));
    return {
      manager,
      command: 'run',
      packages: [command],
      flags,
      raw: commandString,
      isGlobal,
      isDev: false,
      isOptional: false,
      isExact: false,
      isPeer: false,
    };
  }
  
  const { flags, remaining } = parseFlags(commandTokens.slice(argsStart));
  
  const packages = remaining.filter(isPackage);
  
  if (flags.global || flags.g) {
    isGlobal = true;
  }
  
  return {
    manager,
    command,
    packages,
    flags,
    raw: commandString,
    isGlobal,
    isDev: !!(flags['save-dev'] || flags.D),
    isOptional: !!(flags['save-optional'] || flags.O),
    isExact: !!(flags['save-exact'] || flags.E),
    isPeer: !!(flags['save-peer']),
  };
}
