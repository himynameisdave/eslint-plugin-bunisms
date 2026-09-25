# eslint-plugin-bunisms 🐰

[![npm version](https://img.shields.io/npm/v/eslint-plugin-bunisms.svg)](https://www.npmjs.com/package/eslint-plugin-bunisms)
[![license](https://img.shields.io/npm/l/eslint-plugin-bunisms.svg)](./LICENSE)
[![CI](https://github.com/himynameisdave/eslint-plugin-bunisms/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/himynameisdave/eslint-plugin-bunisms/actions/workflows/ci.yml?query=branch%3Amain)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhimynameisdave%2Feslint-plugin-bunisms.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fhimynameisdave%2Feslint-plugin-bunisms?ref=badge_shield&issueType=license)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhimynameisdave%2Feslint-plugin-bunisms.svg?type=shield&issueType=security)](https://app.fossa.com/projects/git%2Bgithub.com%2Fhimynameisdave%2Feslint-plugin-bunisms?ref=badge_shield&issueType=security)

> ESLint rules for idiomatic and correct Bun code. Supports JavaScript and TypeScript, ESLint 9–10, and Oxlint.

## Installation

```bash
bun add -D eslint-plugin-bunisms
```

Not a bun user? It's a regular npm package, so any package manager works:

```bash
npm install -D eslint-plugin-bunisms
pnpm add -D eslint-plugin-bunisms
yarn add -D eslint-plugin-bunisms
```

You also need `oxlint` or `eslint` installed.

## Oxlint

```ts
// oxlint.config.ts
import { defineConfig } from 'oxlint';

export default defineConfig({
  jsPlugins: [{ name: 'bun', specifier: 'eslint-plugin-bunisms' }],
  rules: {
    'bun/prefer-bun-file': 'warn',
    'bun/prefer-bun-write': 'warn',
    'bun/prefer-bun-spawn': 'warn',
  },
});
```

ESLint is optional when using Oxlint. Oxlint's JavaScript plugin support is currently alpha; compatibility is tested in CI.

## ESLint

```ts
// eslint.config.ts
import bun from 'eslint-plugin-bunisms';

export default [bun.configs.recommended];
```

ESLint needs [`jiti`](https://github.com/unjs/jiti) to load a TypeScript config file on Node. For TypeScript files, configure a TypeScript parser such as `@typescript-eslint/parser`. These rules do not require type information.

## Rules

| Rule                                                   | Recommends                                                                 |
| ------------------------------------------------------ | -------------------------------------------------------------------------- |
| [bun/prefer-bun-file](docs/rules/prefer-bun-file.md)   | `Bun.file()` instead of Node's `readFile()`                                |
| [bun/prefer-bun-write](docs/rules/prefer-bun-write.md) | `Bun.write()` instead of Node's `writeFile()`                              |
| [bun/prefer-bun-spawn](docs/rules/prefer-bun-spawn.md) | `Bun.spawn()` / `Bun.spawnSync()` instead of Node's subprocess equivalents |

Rules recognize imports, aliases and CommonJS bindings, respecting lexical scope. They report calls without automatically rewriting them: Node and Bun APIs have different options and return values.

The `recommended`, `strict` and `all` ESLint presets currently enable all three rules as warnings. Override individual rules after the preset:

```ts
export default [bun.configs.recommended, { rules: { 'bun/prefer-bun-file': 'error' } }];
```

## Compatibility

Targets **Bun >=1.4.0** applications. The plugin itself runs on **Node >=18.18.0**, subject to your linter's Node requirements, and has no runtime dependencies.

Apply the plugin only to code intended for Bun. For a mixed-runtime project, scope the ESLint preset with `files`:

```ts
export default [{ ...bun.configs.recommended, files: ['scripts/**/*.ts'] }];
```

See [Contributing](CONTRIBUTING.md) for development and [the roadmap](docs/roadmap.md) for planned rules.

## See also

- [`@himynameisdave/oxlint-config`](https://github.com/himynameisdave/oxlint-config)
- [`@himynameisdave/oxfmt-config`](https://github.com/himynameisdave/oxfmt-config)

[MIT](LICENSE) © Dave Lunny
