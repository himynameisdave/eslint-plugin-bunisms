# eslint-plugin-bunisms 🐰

[![npm version](https://img.shields.io/npm/v/eslint-plugin-bunisms.svg)](https://www.npmjs.com/package/eslint-plugin-bunisms)
[![CI](https://github.com/himynameisdave/eslint-plugin-bunisms/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/himynameisdave/eslint-plugin-bunisms/actions/workflows/ci.yml?query=branch%3Amain)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhimynameisdave%2Feslint-plugin-bunisms.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fhimynameisdave%2Feslint-plugin-bunisms?ref=badge_shield&issueType=license)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhimynameisdave%2Feslint-plugin-bunisms.svg?type=shield&issueType=security)](https://app.fossa.com/projects/git%2Bgithub.com%2Fhimynameisdave%2Feslint-plugin-bunisms?ref=badge_shield&issueType=security)

> ESLint rules for idiomatic and correct Bun code. Supports TypeScript and JavaScript, Oxlint, and ESLint 9–10.

## Installation

```bash
bun add -D eslint-plugin-bunisms
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
    'bun/prefer-bun-crypto-hasher': 'warn',
    'bun/prefer-import-meta-path': 'warn',
    'bun/prefer-import-meta-dir': 'warn',
    'bun/prefer-import-meta-main': 'warn',
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

| Rule                                                                                     | Recommends                                                                   |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [bun/prefer-bun-file](docs/rules/prefer-bun-file.md)                                     | `Bun.file()` instead of Node's `readFile()`                                  |
| [bun/prefer-bun-write](docs/rules/prefer-bun-write.md)                                   | `Bun.write()` instead of Node's `writeFile()`                                |
| [bun/prefer-bun-spawn](docs/rules/prefer-bun-spawn.md)                                   | `Bun.spawn()` / `Bun.spawnSync()` instead of Node's subprocess equivalents   |
| [bun/prefer-fetch](docs/rules/prefer-fetch.md)                                           | `fetch()` instead of Node HTTP client `get()` / `request()` (strict and all) |
| [bun/prefer-bun-crypto-hasher](docs/rules/prefer-bun-crypto-hasher.md)                   | `Bun.CryptoHasher` instead of supported `createHash()` chains                |
| [bun/prefer-bun-shell](docs/rules/prefer-bun-shell.md)                                   | Bun Shell instead of shell-oriented `exec()` calls (strict and all)          |
| [bun/prefer-import-meta-path](docs/rules/prefer-import-meta-path.md)                     | `import.meta.path` instead of `fileURLToPath(import.meta.url)`               |
| [bun/prefer-import-meta-dir](docs/rules/prefer-import-meta-dir.md)                       | `import.meta.dir` instead of `dirname(fileURLToPath(import.meta.url))`       |
| [bun/prefer-import-meta-main](docs/rules/prefer-import-meta-main.md)                     | `import.meta.main` instead of entrypoint comparisons                         |
| [bun/prefer-import-meta-resolve](docs/rules/prefer-import-meta-resolve.md)               | Consider ESM module resolution with `import.meta.resolve()` (strict and all) |
| [bun/no-dotenv](docs/rules/no-dotenv.md)                                                 | Avoid redundant standard dotenv initialization when targeting Bun            |
| [bun/no-late-module-mock](docs/rules/no-late-module-mock.md)                             | Warn when a static import can run before `mock.module()` (strict and all)    |
| [bun/prefer-mock-restore-in-after-each](docs/rules/prefer-mock-restore-in-after-each.md) | Restore Bun mocks after each test (strict and all)                           |

Rules recognize imports, aliases and CommonJS bindings, respecting lexical scope. The exception is `prefer-import-meta-resolve`, which only checks direct global `require.resolve()` calls and skips CommonJS files. They report calls and entrypoint comparisons without automatically rewriting them. Review runtime compatibility and semantics before migrating.

The `recommended`, `strict` and `all` ESLint presets enable rules as warnings. `prefer-bun-shell`, `prefer-fetch`, `prefer-import-meta-resolve`, `no-late-module-mock` and `prefer-mock-restore-in-after-each` are limited to `strict` and `all` because shell behavior, HTTP client semantics, callback handling, module resolution semantics, module mock timing and test cleanup policy need deliberate migration. Override individual rules after the preset:

```ts
export default [bun.configs.recommended, { rules: { 'bun/prefer-bun-file': 'error' } }];
```

## Compatibility

Targets **Bun >=1.4.0** applications. The plugin itself runs on **Node >=18.18.0**, subject to your linter's Node requirements, and has no runtime dependencies.

Apply the plugin only to code intended for Bun. For a mixed-runtime project, scope the ESLint preset with `files`:

```ts
export default [{ ...bun.configs.recommended, files: ['scripts/**/*.ts'] }];
```

See [Contributing](CONTRIBUTING.md) for development, [the roadmap](https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/roadmap.md) for planned rules, and [Versioning](https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/VERSIONING.md) for the release policy.

## See also

- [`@himynameisdave/oxlint-config`](https://github.com/himynameisdave/oxlint-config)
- [`@himynameisdave/oxfmt-config`](https://github.com/himynameisdave/oxfmt-config)

---

<sub>_[MIT](LICENSE) © Dave Lunny_</sub>
