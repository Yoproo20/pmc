import { bench, group, run } from 'mitata';
import { parseCommand } from '../src/parser';
import { convertCommand, convert } from '../src/converter';
import type { PackageManager } from '../src/types';

const SIMPLE_COMMANDS = [
  'npm install',
  'yarn add lodash',
  'pnpm remove axios',
];

const COMPLEX_COMMANDS = [
  'npm install lodash@4.17.21 -D -E',
  'yarn add react react-dom @types/react -D',
  'pnpm add -g typescript prettier eslint',
  'npm install --save-peer lodash --save-optional axios',
  'npx create-react-app my-app --template typescript',
  'bun add @types/node@20 @types/react@18 -D --exact',
];

const targets: PackageManager[] = ['npm', 'yarn', 'pnpm', 'bun'];

group('Parse commands', () => {
  bench('simple commands', () => {
    for (const cmd of SIMPLE_COMMANDS) {
      parseCommand(cmd);
    }
  });

  bench('complex commands', () => {
    for (const cmd of COMPLEX_COMMANDS) {
      parseCommand(cmd);
    }
  });
});

group('Full conversion', () => {
  for (const target of targets) {
    bench(`convert to ${target}`, () => {
      for (const cmd of COMPLEX_COMMANDS) {
        convert(cmd, target);
      }
    });
  }
});

group('Individual conversions', () => {
  bench('npm install lodash -D -> bun', () => {
    convert('npm install lodash -D', 'bun');
  });

  bench('yarn add react react-dom -> pnpm', () => {
    convert('yarn add react react-dom', 'pnpm');
  });

  bench('npx create-app -> bunx', () => {
    convert('npx create-react-app my-app', 'bun');
  });

  bench('pnpm add -g typescript -> yarn global', () => {
    convert('pnpm add -g typescript', 'yarn');
  });
});

await run();
