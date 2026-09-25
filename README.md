# eslint-plugin-bunisms 🐰
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhimynameisdave%2Feslint-plugin-bunisms.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fhimynameisdave%2Feslint-plugin-bunisms?ref=badge_shield)


ESLint rules for idiomatic and correct Bun code. Supports JavaScript and TypeScript, ESLint 9–10, and Oxlint.

## ESLint

```sh
bun add --dev eslint eslint-plugin-bunisms
```

```js
// eslint.config.mjs
import bun from 'eslint-plugin-bunisms';

export default [bun.configs.recommended];
```

For TypeScript files, configure a TypeScript parser such as `@typescript-eslint/parser`. These rules do not require type information.

## Oxlint

```sh
bun add --dev oxlint eslint-plugin-bunisms
```

Add to `.oxlintrc.json`:

```json
{
  "jsPlugins": [{ "name": "bun", "specifier": "eslint-plugin-bunisms" }],
  "rules": {
    "bun/prefer-bun-file": "warn",
    "bun/prefer-bun-write": "warn",
    "bun/prefer-bun-spawn": "warn"
  }
}
```

ESLint is optional when using Oxlint. Oxlint's JavaScript plugin support is currently alpha; compatibility is tested in CI.

## Rules

| Rule                                                   | Recommends                                                                 |
| ------------------------------------------------------ | -------------------------------------------------------------------------- |
| [bun/prefer-bun-file](docs/rules/prefer-bun-file.md)   | `Bun.file()` instead of Node's `readFile()`                                |
| [bun/prefer-bun-write](docs/rules/prefer-bun-write.md) | `Bun.write()` instead of Node's `writeFile()`                              |
| [bun/prefer-bun-spawn](docs/rules/prefer-bun-spawn.md) | `Bun.spawn()` / `Bun.spawnSync()` instead of Node's subprocess equivalents |

Rules recognize imports, aliases and CommonJS bindings, respecting lexical scope. They report calls without automatically rewriting them: Node and Bun APIs have different options and return values.

The `recommended`, `strict` and `all` ESLint presets currently enable all three rules as warnings. Override individual rules after the preset:

```js
export default [bun.configs.recommended, { rules: { 'bun/prefer-bun-file': 'error' } }];
```

## Compatibility

Targets **Bun >=1.4.0** applications. The plugin itself runs on **Node >=18.18.0**, subject to your linter's Node requirements, and has no runtime dependencies.

Apply the plugin only to code intended for Bun. For a mixed-runtime project, scope the ESLint preset with `files`:

```js
export default [{ ...bun.configs.recommended, files: ['scripts/**/*.js'] }];
```

See [Contributing](CONTRIBUTING.md) for development and [the roadmap](docs/roadmap.md) for planned rules.

[MIT](LICENSE) © Dave Lunny


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhimynameisdave%2Feslint-plugin-bunisms.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fhimynameisdave%2Feslint-plugin-bunisms?ref=badge_large)