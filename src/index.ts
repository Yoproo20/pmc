export type { PackageManager, ParsedCommand, ConversionResult } from './types';
export { LOCKFILE_PRIORITY, PACKAGE_MANAGERS } from './types';
export { detectPackageManager, detectPackageManagerFromCommand } from './detector';
export { parseCommand } from './parser';
export { convertCommand, convert } from './converter';
export { COMMAND_MAPPINGS, getCommandMapping, normalizeCommand } from './mappings/commands';
export { FLAG_MAPPINGS, SHORTHAND_FLAGS, getFlagMapping, normalizeFlag } from './mappings/flags';
