import { parseCommand } from '../src/parser';
import { convertCommand } from '../src/converter';
import { convert } from '../src/index';

const COMMANDS = [
  'npm install lodash -D',
  'yarn add react react-dom',
  'pnpm add -g typescript',
  'npm run build',
  'npx create-react-app my-app',
  'bun add @types/node@20 -E',
  'npm install --save-peer lodash',
  'yarn global add prettier',
  'pnpm install --frozen-lockfile',
  'npm uninstall axios',
];

console.log('=== Quick Benchmark ===\n');

const iterations = 10000;
const targets = ['npm', 'yarn', 'pnpm', 'bun'] as const;

console.log(`Commands: ${COMMANDS.length}`);
console.log(`Iterations per command: ${iterations.toLocaleString()}`);
console.log(`Total operations: ${(COMMANDS.length * iterations).toLocaleString()}\n`);

const start = Bun.nanoseconds();

for (let i = 0; i < iterations; i++) {
  for (const cmd of COMMANDS) {
    for (const target of targets) {
      convert(cmd, target);
    }
  }
}

const end = Bun.nanoseconds();
const totalNs = end - start;
const totalMs = totalNs / 1_000_000;
const totalOps = COMMANDS.length * iterations * targets.length;
const opsPerSec = Math.round(totalOps / (totalMs / 1000));
const avgNs = totalNs / totalOps;

console.log('Results:');
console.log(`  Total time: ${totalMs.toFixed(2)}ms`);
console.log(`  Operations: ${totalOps.toLocaleString()}`);
console.log(`  Ops/sec: ${opsPerSec.toLocaleString()}`);
console.log(`  Avg time: ${avgNs.toFixed(2)}ns per conversion`);

console.log('\n=== Parse Only ===');
const parseStart = Bun.nanoseconds();
for (let i = 0; i < iterations; i++) {
  for (const cmd of COMMANDS) {
    parseCommand(cmd);
  }
}
const parseEnd = Bun.nanoseconds();
const parseOps = COMMANDS.length * iterations;
const parseNs = parseEnd - parseStart;
console.log(`  Parse ops/sec: ${Math.round(parseOps / ((parseNs / 1_000_000) / 1000)).toLocaleString()}`);
