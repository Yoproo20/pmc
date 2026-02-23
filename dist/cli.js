#!/usr/bin/env bun

// src/cli.ts
import { parseArgs } from "util";

// src/types.ts
var LOCKFILE_PRIORITY = [
  { file: "pnpm-lock.yaml", manager: "pnpm" },
  { file: "yarn.lock", manager: "yarn" },
  { file: "bun.lock", manager: "bun" },
  { file: "bun.lockb", manager: "bun" },
  { file: "package-lock.json", manager: "npm" }
];
var PACKAGE_MANAGERS = ["npm", "yarn", "pnpm", "bun"];

// src/detector.ts
import { existsSync } from "fs";
import { resolve } from "path";
function detectPackageManager(cwd = process.cwd()) {
  for (const { file, manager } of LOCKFILE_PRIORITY) {
    const lockfilePath = resolve(cwd, file);
    if (existsSync(lockfilePath)) {
      return manager;
    }
  }
  return null;
}
function detectPackageManagerFromCommand(command) {
  const trimmed = command.trim();
  const firstWord = trimmed.split(/\s+/)[0];
  if (firstWord === "npx")
    return "npm";
  if (firstWord === "bunx")
    return "bun";
  if (firstWord === "dlx")
    return "yarn";
  const managerPatterns = [
    { pattern: /^npm(\s|$)/, manager: "npm" },
    { pattern: /^yarn(\s|$)/, manager: "yarn" },
    { pattern: /^pnpm(\s|$)/, manager: "pnpm" },
    { pattern: /^bun(\s|$)/, manager: "bun" }
  ];
  for (const { pattern, manager } of managerPatterns) {
    if (pattern.test(trimmed)) {
      return manager;
    }
  }
  return null;
}

// src/mappings/flags.ts
var FLAG_MAPPINGS = {
  save: {
    npm: "--save",
    yarn: "",
    pnpm: "",
    bun: "",
    description: "Save to dependencies (default)"
  },
  "save-dev": {
    npm: "--save-dev",
    yarn: "--dev",
    pnpm: "--save-dev",
    bun: "--dev",
    description: "Save as dev dependency"
  },
  D: {
    npm: "-D",
    yarn: "-D",
    pnpm: "-D",
    bun: "-D",
    description: "Save as dev dependency (shorthand)"
  },
  "save-optional": {
    npm: "--save-optional",
    yarn: "--optional",
    pnpm: "--save-optional",
    bun: "--optional",
    description: "Save as optional dependency"
  },
  O: {
    npm: "-O",
    yarn: "--optional",
    pnpm: "-O",
    bun: "--optional",
    description: "Save as optional dependency (shorthand)"
  },
  "save-exact": {
    npm: "--save-exact",
    yarn: "--exact",
    pnpm: "--save-exact",
    bun: "--exact",
    description: "Save with exact version"
  },
  E: {
    npm: "-E",
    yarn: "--exact",
    pnpm: "-E",
    bun: "--exact",
    description: "Save with exact version (shorthand)"
  },
  "save-peer": {
    npm: "--save-peer",
    yarn: "--peer",
    pnpm: "--save-peer",
    bun: "",
    description: "Save as peer dependency (not supported in bun)"
  },
  global: {
    npm: "--global",
    yarn: "global",
    pnpm: "--global",
    bun: "--global",
    description: "Operate globally"
  },
  g: {
    npm: "-g",
    yarn: "global",
    pnpm: "-g",
    bun: "-g",
    description: "Operate globally (shorthand)"
  },
  force: {
    npm: "--force",
    yarn: "--force",
    pnpm: "--force",
    bun: "--force",
    description: "Force operation"
  },
  "frozen-lockfile": {
    npm: "--frozen-lockfile",
    yarn: "--frozen-lockfile",
    pnpm: "--frozen-lockfile",
    bun: "--frozen-lockfile",
    description: "Install from lockfile only"
  },
  production: {
    npm: "--production",
    yarn: "--production",
    pnpm: "--production",
    bun: "--production",
    description: "Install production deps only"
  },
  dev: {
    npm: "--include=dev",
    yarn: "--dev",
    pnpm: "--dev",
    bun: "--dev",
    description: "Include dev dependencies"
  },
  optional: {
    npm: "--include=optional",
    yarn: "--optional",
    pnpm: "--optional",
    bun: "--optional",
    description: "Include optional dependencies"
  },
  "no-optional": {
    npm: "--omit=optional",
    yarn: "--no-optional",
    pnpm: "--no-optional",
    bun: "--no-optional",
    description: "Omit optional dependencies"
  },
  verbose: {
    npm: "--verbose",
    yarn: "--verbose",
    pnpm: "--verbose",
    bun: "--verbose",
    description: "Verbose output"
  },
  quiet: {
    npm: "--quiet",
    yarn: "--silent",
    pnpm: "--silent",
    bun: "--silent",
    description: "Quiet output"
  },
  silent: {
    npm: "--silent",
    yarn: "--silent",
    pnpm: "--silent",
    bun: "--silent",
    description: "Silent output"
  },
  "no-save": {
    npm: "--no-save",
    yarn: "--no-save",
    pnpm: "--no-save",
    bun: "--no-save",
    description: "Do not save to package.json"
  },
  legacyPeerDeps: {
    npm: "--legacy-peer-deps",
    yarn: "--ignore-peer-dependencies",
    pnpm: "--ignore-peer-dependencies",
    bun: "",
    description: "Ignore peer dependencies"
  },
  ignoreScripts: {
    npm: "--ignore-scripts",
    yarn: "--ignore-scripts",
    pnpm: "--ignore-scripts",
    bun: "--ignore-scripts",
    description: "Skip scripts"
  },
  workspace: {
    npm: "--workspace",
    yarn: "--workspace",
    pnpm: "--filter",
    bun: "--filter",
    description: "Workspace filter"
  }
};
var SHORTHAND_FLAGS = {
  "-D": { full: "save-dev", value: true },
  "-g": { full: "global", value: true },
  "-O": { full: "save-optional", value: true },
  "-E": { full: "save-exact", value: true },
  "-P": { full: "save-prod", value: true }
};
function getFlagMapping(flag, target) {
  const cleanFlag = flag.replace(/^-+/, "");
  const mapping = FLAG_MAPPINGS[cleanFlag];
  if (!mapping)
    return;
  return mapping[target];
}
function normalizeFlag(flag) {
  const cleanFlag = flag.replace(/^-+/, "");
  if (SHORTHAND_FLAGS[`-${cleanFlag}`]) {
    return SHORTHAND_FLAGS[`-${cleanFlag}`].full;
  }
  return cleanFlag;
}

// src/parser.ts
var PACKAGE_MANAGER_ALIASES = {
  npm: "npm",
  yarn: "yarn",
  pnpm: "pnpm",
  bun: "bun",
  npx: "npm",
  bunx: "bun",
  dlx: "yarn"
};
var SCRIPT_COMMANDS = ["run", "run-script"];
var SPECIAL_COMMANDS = ["npx", "bunx", "dlx"];
function isPackage(arg) {
  if (arg.startsWith("-"))
    return false;
  if (arg.startsWith("@") || !arg.includes("@"))
    return true;
  const atIndex = arg.indexOf("@");
  const beforeAt = arg.substring(0, atIndex);
  return beforeAt.includes("/") || atIndex > 0;
}
function parseFlags(args) {
  const flags = {};
  const remaining = [];
  for (let i = 0;i < args.length; i++) {
    const arg = args[i];
    if (arg === "--") {
      remaining.push(...args.slice(i));
      break;
    }
    if (arg.startsWith("--")) {
      const flagName = arg.slice(2);
      if (flagName.includes("=")) {
        const [name, value] = flagName.split("=");
        flags[name] = value;
      } else if (i + 1 < args.length && !args[i + 1].startsWith("-") && !isPackage(args[i + 1])) {
        flags[flagName] = args[i + 1];
        i++;
      } else {
        flags[flagName] = true;
      }
    } else if (arg.startsWith("-") && arg.length === 2) {
      const flagChar = arg[1];
      const shorthand = SHORTHAND_FLAGS[arg];
      if (shorthand) {
        flags[shorthand.full] = shorthand.value;
      } else {
        flags[flagChar] = true;
      }
    } else if (arg.startsWith("-") && arg.length > 2 && !arg.startsWith("--")) {
      for (let j = 1;j < arg.length; j++) {
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
function parseCommand(commandString) {
  const trimmed = commandString.trim();
  if (!trimmed)
    return null;
  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 0)
    return null;
  let manager;
  let firstToken = tokens[0];
  let commandTokens;
  if (SPECIAL_COMMANDS.includes(firstToken)) {
    manager = PACKAGE_MANAGER_ALIASES[firstToken];
    const remaining2 = tokens.slice(1);
    return {
      manager,
      command: firstToken,
      packages: remaining2,
      flags: {},
      raw: commandString,
      isGlobal: false,
      isDev: false,
      isOptional: false,
      isExact: false,
      isPeer: false
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
      command: "install",
      packages: [],
      flags: {},
      raw: commandString,
      isGlobal: false,
      isDev: false,
      isOptional: false,
      isExact: false,
      isPeer: false
    };
  }
  let command = commandTokens[0];
  let isGlobal = false;
  let argsStart = 1;
  if (manager === "yarn" && command === "global") {
    isGlobal = true;
    command = commandTokens[1] || "install";
    argsStart = 2;
  }
  if (SCRIPT_COMMANDS.includes(command)) {
    const scriptName = commandTokens[1];
    if (scriptName && !scriptName.startsWith("-")) {
      const { flags: flags2, remaining: remaining2 } = parseFlags(commandTokens.slice(2));
      return {
        manager,
        command: "run",
        packages: [scriptName, ...remaining2],
        flags: flags2,
        raw: commandString,
        isGlobal,
        isDev: false,
        isOptional: false,
        isExact: false,
        isPeer: false
      };
    }
  }
  if (command === "test" || command === "start" || command === "build") {
    const { flags: flags2 } = parseFlags(commandTokens.slice(1));
    return {
      manager,
      command: "run",
      packages: [command],
      flags: flags2,
      raw: commandString,
      isGlobal,
      isDev: false,
      isOptional: false,
      isExact: false,
      isPeer: false
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
    isDev: !!(flags["save-dev"] || flags.D),
    isOptional: !!(flags["save-optional"] || flags.O),
    isExact: !!(flags["save-exact"] || flags.E),
    isPeer: !!flags["save-peer"]
  };
}

// src/mappings/commands.ts
var COMMAND_MAPPINGS = {
  install: {
    npm: "install",
    yarn: "install",
    pnpm: "install",
    bun: "install",
    description: "Install all dependencies"
  },
  i: {
    npm: "install",
    yarn: "add",
    pnpm: "add",
    bun: "add",
    description: "Install packages"
  },
  add: {
    npm: "install",
    yarn: "add",
    pnpm: "add",
    bun: "add",
    description: "Add packages"
  },
  installDev: {
    npm: "install -D",
    yarn: "add -D",
    pnpm: "add -D",
    bun: "add -D",
    description: "Install as dev dependency"
  },
  uninstall: {
    npm: "uninstall",
    yarn: "remove",
    pnpm: "remove",
    bun: "remove",
    description: "Remove packages"
  },
  remove: {
    npm: "uninstall",
    yarn: "remove",
    pnpm: "remove",
    bun: "remove",
    description: "Remove packages"
  },
  rm: {
    npm: "uninstall",
    yarn: "remove",
    pnpm: "remove",
    bun: "remove",
    description: "Remove packages (shorthand)"
  },
  update: {
    npm: "update",
    yarn: "upgrade",
    pnpm: "update",
    bun: "update",
    description: "Update packages"
  },
  upgrade: {
    npm: "update",
    yarn: "upgrade",
    pnpm: "update",
    bun: "update",
    description: "Upgrade packages"
  },
  run: {
    npm: "run",
    yarn: "run",
    pnpm: "run",
    bun: "run",
    description: "Run a script"
  },
  exec: {
    npm: "exec",
    yarn: "exec",
    pnpm: "exec",
    bun: "run",
    description: "Execute a command"
  },
  npx: {
    npm: "npx",
    yarn: "yarn dlx",
    pnpm: "pnpm dlx",
    bun: "bunx",
    description: "Run a package binary"
  },
  dlx: {
    npm: "npx",
    yarn: "yarn dlx",
    pnpm: "pnpm dlx",
    bun: "bunx",
    description: "Run a package binary (download)"
  },
  bunx: {
    npm: "npx",
    yarn: "yarn dlx",
    pnpm: "pnpm dlx",
    bun: "bunx",
    description: "Run a package binary (bun)"
  },
  init: {
    npm: "init",
    yarn: "init",
    pnpm: "init",
    bun: "init",
    description: "Initialize a new project"
  },
  create: {
    npm: "create",
    yarn: "create",
    pnpm: "create",
    bun: "create",
    description: "Create a new project from template"
  },
  ci: {
    npm: "ci",
    yarn: "install --frozen-lockfile",
    pnpm: "install --frozen-lockfile",
    bun: "install --frozen-lockfile",
    description: "Clean install from lockfile"
  },
  audit: {
    npm: "audit",
    yarn: "npm audit",
    pnpm: "audit",
    bun: "npm audit",
    description: "Check for vulnerabilities"
  },
  outdated: {
    npm: "outdated",
    yarn: "outdated",
    pnpm: "outdated",
    bun: "npm outdated",
    description: "Check for outdated packages"
  },
  cacheClean: {
    npm: "cache clean",
    yarn: "cache clean",
    pnpm: "store prune",
    bun: "npm cache clean",
    description: "Clean package cache"
  },
  link: {
    npm: "link",
    yarn: "link",
    pnpm: "link",
    bun: "link",
    description: "Link a package locally"
  },
  unlink: {
    npm: "unlink",
    yarn: "unlink",
    pnpm: "unlink",
    bun: "unlink",
    description: "Unlink a local package"
  },
  list: {
    npm: "list",
    yarn: "list",
    pnpm: "list",
    bun: "pm ls",
    description: "List installed packages"
  },
  ls: {
    npm: "list",
    yarn: "list",
    pnpm: "list",
    bun: "pm ls",
    description: "List installed packages (shorthand)"
  },
  info: {
    npm: "info",
    yarn: "info",
    pnpm: "info",
    bun: "info",
    description: "Show package info"
  },
  why: {
    npm: "why",
    yarn: "why",
    pnpm: "why",
    bun: "pm ls",
    description: "Show why a package is installed"
  },
  pack: {
    npm: "pack",
    yarn: "pack",
    pnpm: "pack",
    bun: "pack",
    description: "Create a tarball from a package"
  },
  publish: {
    npm: "publish",
    yarn: "publish",
    pnpm: "publish",
    bun: "publish",
    description: "Publish a package"
  },
  version: {
    npm: "version",
    yarn: "version",
    pnpm: "version",
    bun: "version",
    description: "Bump package version"
  }
};
function getCommandMapping(command, target) {
  const mapping = COMMAND_MAPPINGS[command];
  if (!mapping)
    return;
  return mapping[target];
}
function normalizeCommand(manager, command) {
  const mappings = {
    npm: { i: "add", install: "add", uninstall: "remove", rm: "remove" },
    yarn: { install: "add", uninstall: "remove", rm: "remove" },
    pnpm: { i: "add", install: "add", uninstall: "remove", rm: "remove" },
    bun: { i: "add", install: "add", uninstall: "remove", rm: "remove" }
  };
  return mappings[manager]?.[command] || command;
}

// src/converter.ts
var COMMAND_ALIASES = {
  i: "add",
  install: "add",
  uninstall: "remove",
  rm: "remove",
  upgrade: "update",
  up: "update",
  list: "ls",
  why: "info"
};
function normalizeCommandKey(command) {
  return COMMAND_ALIASES[command] || command;
}
function buildFlagsString(flags, target, warnings) {
  const flagParts = [];
  const skipFlags = new Set(["global", "g", "save-dev", "D", "save-optional", "O", "save-exact", "E", "save-peer"]);
  for (const [flagName, value] of Object.entries(flags)) {
    const mappedFlag = getFlagMapping(flagName, target);
    if (skipFlags.has(flagName)) {
      continue;
    }
    if (mappedFlag === "")
      continue;
    if (mappedFlag) {
      if (value === true) {
        flagParts.push(mappedFlag);
      } else if (typeof value === "string") {
        if (mappedFlag.startsWith("--")) {
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
  return flagParts.join(" ");
}
function convertCommand(parsed, target) {
  const warnings = [];
  const parts = [];
  let command = normalizeCommandKey(parsed.command);
  if (command === "npx" || command === "dlx" || command === "bunx") {
    const mapping = getCommandMapping(command, target);
    if (mapping) {
      parts.push(mapping);
      parts.push(...parsed.packages);
      const flagsStr2 = buildFlagsString(parsed.flags, target, warnings);
      if (flagsStr2)
        parts.push(flagsStr2);
      return { command: parts.join(" "), warnings: warnings.length > 0 ? warnings : undefined };
    }
  }
  if (parsed.isGlobal && target === "yarn") {
    parts.push("yarn", "global");
  } else {
    parts.push(target);
  }
  if (command === "run" && parsed.packages.length > 0) {
    parts.push("run", parsed.packages[0]);
    if (parsed.packages.length > 1) {
      parts.push("--", ...parsed.packages.slice(1));
    }
    const flagsStr2 = buildFlagsString(parsed.flags, target, warnings);
    if (flagsStr2)
      parts.push(flagsStr2);
    return { command: parts.join(" "), warnings: warnings.length > 0 ? warnings : undefined };
  }
  const mappedCommand = getCommandMapping(command, target);
  if (mappedCommand) {
    const cmdParts = mappedCommand.split(" ");
    parts.push(...cmdParts);
  } else if (command) {
    parts.push(command);
    warnings.push(`Unknown command "${command}" may not be supported in ${target}`);
  }
  if (parsed.packages.length > 0) {
    parts.push(...parsed.packages);
  }
  if (parsed.isDev) {
    const devFlag = target === "npm" ? "-D" : "-D";
    parts.push(devFlag);
  }
  if (parsed.isOptional) {
    const optFlag = target === "npm" ? "-O" : target === "bun" ? "--optional" : "--optional";
    parts.push(optFlag);
  }
  if (parsed.isExact) {
    const exactFlag = target === "npm" ? "-E" : "--exact";
    parts.push(exactFlag);
  }
  if (parsed.isPeer) {
    if (target === "bun") {
      warnings.push("--save-peer is not supported in bun, skipping");
    } else {
      const peerFlag = target === "npm" ? "--save-peer" : "--peer";
      parts.push(peerFlag);
    }
  }
  if (parsed.isGlobal && target !== "yarn") {
    parts.push("-g");
  }
  const flagsStr = buildFlagsString(parsed.flags, target, warnings);
  if (flagsStr)
    parts.push(flagsStr);
  return { command: parts.join(" "), warnings: warnings.length > 0 ? warnings : undefined };
}
function convert(commandString, target, source) {
  let parsed = parseCommand(commandString);
  if (!parsed) {
    return {
      command: `${target} install`,
      warnings: ["Could not parse command, defaulting to install"]
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

// src/cli.ts
function printUsage() {
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
function isValidPackageManager(value) {
  return PACKAGE_MANAGERS.includes(value);
}
function main() {
  const { values, positionals } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      help: {
        type: "boolean",
        short: "h"
      }
    },
    strict: false
  });
  if (values.help) {
    printUsage();
    process.exit(0);
  }
  if (positionals.length === 0) {
    console.error("Error: Missing target package manager");
    console.error("Usage: pmc <target> [command]");
    process.exit(1);
  }
  const target = positionals[0];
  if (!isValidPackageManager(target)) {
    console.error(`Error: Invalid package manager "${target}"`);
    console.error(`Valid options: ${PACKAGE_MANAGERS.join(", ")}`);
    process.exit(1);
  }
  const commandString = positionals.slice(1).join(" ").trim();
  if (!commandString) {
    const detected = detectPackageManager();
    const sourceManager = detected || "npm";
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
