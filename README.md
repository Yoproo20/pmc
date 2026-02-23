# pmc - Package Manager Converter

Convert package manager commands between npm, yarn, pnpm, and bun.

## Installation

```bash
bun install -g pkg-convert
npm install pkg-convert
pnpm add pkg-convert
yarn add pkg-convert
```

## Usage

### Convert a command

```bash
# Convert to bun
pmc bun "npm install lodash -D"

# Convert to pnpm
pmc pnpm "yarn add react react-dom"

# Convert to yarn
pmc yarn "pnpm add -g typescript"

# Convert to npm
pmc npm "bun add lodash@4.17.21"
```

### Auto-detect source (no command = install)

```bash
pmc bun     # Output: bun install
pmc yarn    # Output: yarn install
pmc pnpm    # Output: pnpm install
```

## Supported Commands

| Action | npm | yarn | pnpm | bun |
|--------|-----|------|------|-----|
| Install all | `npm install` | `yarn install` | `pnpm install` | `bun install` |
| Add package | `npm i pkg` | `yarn add pkg` | `pnpm add pkg` | `bun add pkg` |
| Add dev | `npm i pkg -D` | `yarn add pkg -D` | `pnpm add pkg -D` | `bun add pkg -D` |
| Remove | `npm uninstall pkg` | `yarn remove pkg` | `pnpm remove pkg` | `bun remove pkg` |
| Update | `npm update` | `yarn upgrade` | `pnpm update` | `bun update` |
| Run script | `npm run build` | `yarn run build` | `pnpm run build` | `bun run build` |
| Run binary | `npx pkg` | `yarn dlx pkg` | `pnpm dlx pkg` | `bunx pkg` |
| Global add | `npm i -g pkg` | `yarn global add pkg` | `pnpm add -g pkg` | `bun add -g pkg` |
| CI install | `npm ci` | `yarn install --frozen-lockfile` | `pnpm install --frozen-lockfile` | `bun install --frozen-lockfile` |

## Flags

| Flag | npm | yarn | pnpm | bun |
|------|-----|------|------|-----|
| Dev dependency | `-D` | `-D` | `-D` | `-D` |
| Optional | `-O` | `--optional` | `-O` | `--optional` |
| Exact version | `-E` | `--exact` | `-E` | `--exact` |
| Global | `-g` | `global` prefix | `-g` | `-g` |
| Peer dependency | `--save-peer` | `--peer` | `--save-peer` | *not supported* |

## API Usage

```typescript
import { convert, parseCommand, convertCommand } from 'pmc';

// Convert a command string
const result = convert('npm install lodash -D', 'bun');
console.log(result.command); // "bun add lodash -D"

// Parse a command
const parsed = parseCommand('yarn add react react-dom -D');
console.log(parsed.packages); // ['react', 'react-dom']
console.log(parsed.isDev);    // true

// Convert parsed command
const result2 = convertCommand(parsed, 'pnpm');
console.log(result2.command); // "pnpm add react react-dom -D"
```

## Lockfile Detection

The CLI auto-detects the current package manager by checking for lockfiles in this priority order:

1. `pnpm-lock.yaml` → pnpm
2. `yarn.lock` → yarn
3. `bun.lock` / `bun.lockb` → bun
4. `package-lock.json` → npm

## Limitations

- `--save-peer` is not supported in bun
- `audit` and `outdated` commands fall back to npm equivalents for bun
- Some Yarn Berry-specific commands may not convert correctly

## License

MIT
