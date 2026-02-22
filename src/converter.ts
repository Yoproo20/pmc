import type { PackageManager, ParsedCommand, ConversionResult } from './types';
import { getCommandMapping, normalizeCommand } from './mappings/commands';
import { getFlagMapping, FLAG_MAPPINGS } from './mappings/flags';
import { parseCommand } from './parser';

const COMMAND_ALIASES: Record<string, string> = {
  i: 'add',
  install: 'add',
  uninstall: 'remove',
  rm: 'remove',
  upgrade: 'update',
  up: 'update',
  list: 'ls',
  why: 'info',
};

function normalizeCommandKey(command: string): string {
  return COMMAND_ALIASES[command] || command;
}

function buildFlagsString(
  flags: Record<string, string | boolean>,
  target: PackageManager,
  warnings: string[]
): string {
  const flagParts: string[] = [];
  
  const skipFlags = new Set(['global', 'g', 'save-dev', 'D', 'save-optional', 'O', 'save-exact', 'E', 'save-peer']);
  
  for (const [flagName, value] of Object.entries(flags)) {
    const mappedFlag = getFlagMapping(flagName, target);
    
    if (skipFlags.has(flagName)) {
      continue;
    }
    
    if (mappedFlag === '') continue;
    
    if (mappedFlag) {
      if (value === true) {
        flagParts.push(mappedFlag);
      } else if (typeof value === 'string') {
        if (mappedFlag.startsWith('--')) {
          flagParts.push(`${mappedFlag}=${value}`);
        } else {
          flagParts.push(mappedFlag, value);
        }
      }
    } else {
      if (value === true) {
        flagParts.push(`--${flagName}`);
      } else {
        flagParts.push(`--${flagName}=${value}`);
      }
      warnings.push(`Unknown flag "${flagName}" may not be supported in ${target}`);
    }
  }
  
  return flagParts.join(' ');
}

export function convertCommand(
  parsed: ParsedCommand,
  target: PackageManager
): ConversionResult {
  const warnings: string[] = [];
  const parts: string[] = [];
  
  let command = normalizeCommandKey(parsed.command);
  
  if (command === 'npx' || command === 'dlx' || command === 'bunx') {
    const mapping = getCommandMapping(command, target);
    if (mapping) {
      parts.push(mapping);
      parts.push(...parsed.packages);
      const flagsStr = buildFlagsString(parsed.flags, target, warnings);
      if (flagsStr) parts.push(flagsStr);
      return { command: parts.join(' '), warnings: warnings.length > 0 ? warnings : undefined };
    }
  }
  
  if (parsed.isGlobal && target === 'yarn') {
    parts.push('yarn', 'global');
  } else {
    parts.push(target);
  }
  
  if (command === 'run' && parsed.packages.length > 0) {
    parts.push('run', parsed.packages[0]);
    if (parsed.packages.length > 1) {
      parts.push('--', ...parsed.packages.slice(1));
    }
    const flagsStr = buildFlagsString(parsed.flags, target, warnings);
    if (flagsStr) parts.push(flagsStr);
    return { command: parts.join(' '), warnings: warnings.length > 0 ? warnings : undefined };
  }
  
  const mappedCommand = getCommandMapping(command, target);
  if (mappedCommand) {
    const cmdParts = mappedCommand.split(' ');
    parts.push(...cmdParts);
  } else if (command) {
    parts.push(command);
    warnings.push(`Unknown command "${command}" may not be supported in ${target}`);
  }
  
  if (parsed.packages.length > 0) {
    parts.push(...parsed.packages);
  }
  
  if (parsed.isDev) {
    const devFlag = target === 'npm' ? '-D' : '-D';
    parts.push(devFlag);
  }
  
  if (parsed.isOptional) {
    const optFlag = target === 'npm' ? '-O' : target === 'bun' ? '--optional' : '--optional';
    parts.push(optFlag);
  }
  
  if (parsed.isExact) {
    const exactFlag = target === 'npm' ? '-E' : '--exact';
    parts.push(exactFlag);
  }
  
  if (parsed.isPeer) {
    if (target === 'bun') {
      warnings.push('--save-peer is not supported in bun, skipping');
    } else {
      const peerFlag = target === 'npm' ? '--save-peer' : '--peer';
      parts.push(peerFlag);
    }
  }
  
  if (parsed.isGlobal && target !== 'yarn') {
    parts.push('-g');
  }
  
  const flagsStr = buildFlagsString(parsed.flags, target, warnings);
  if (flagsStr) parts.push(flagsStr);
  
  return { command: parts.join(' '), warnings: warnings.length > 0 ? warnings : undefined };
}

export function convert(
  commandString: string,
  target: PackageManager,
  source?: PackageManager
): ConversionResult {
  let parsed = parseCommand(commandString);
  
  if (!parsed) {
    return {
      command: `${target} install`,
      warnings: ['Could not parse command, defaulting to install'],
    };
  }
  
  if (source && parsed.manager !== source) {
    const newParsed = parseCommand(commandString.replace(parsed.manager, source));
    if (newParsed) {
      parsed = { ...newParsed, manager: source };
    }
  }
  
  return convertCommand(parsed, target);
}
