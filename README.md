# eslint-plugin-bunisms 🐰

ESLint rules for idiomatic and correct Bun code.

```js
// Instead of:
import { readFile } from "node:fs/promises";
const text = await readFile("hello.txt", "utf8");

// Consider:
const text = await Bun.file("hello.txt").text();
```

Version 0.1.0 contains three diagnostic-only rules. They identify calls through Node builtin bindings, explain the Bun alternative, and leave migration decisions to you. Node APIs are supported by Bun and can still be the right choice.

## Try 0.1.0

The initial package is ready for testing; it has not yet been published to npm. Download the `eslint-plugin-bunisms-tarball` artifact from a successful [CI run](https://github.com/himynameisdave/eslint-plugin-bunisms/actions/workflows/ci.yml), unzip it, and install:

```sh
bun add --dev ./eslint-plugin-bunisms-0.1.0.tgz eslint
```

After publication, install with `bun add --dev eslint-plugin-bunisms eslint`.

## ESLint flat config

```js
// eslint.config.mjs
import bun from "eslint-plugin-bunisms";

export default [bun.configs.recommended];
```

For TypeScript, configure your usual TypeScript parser. No type information or TypeScript project is required by these rules.

For projects that also run under Node or in browsers, scope the configuration to Bun-only files:

```js
import bun from "eslint-plugin-bunisms";

export default [{ ...bun.configs.recommended, files: ["scripts/**/*.ts"] }];
```

## Rules and presets

| Rule | Detects | Recommended | Strict | All |
| --- | --- | --- | --- | --- |
| [bun/prefer-bun-file](docs/rules/prefer-bun-file.md) | `readFile()` → `Bun.file()` | warn | warn | warn |
| [bun/prefer-bun-write](docs/rules/prefer-bun-write.md) | `writeFile()` → `Bun.write()` | warn | warn | warn |
| [bun/prefer-bun-spawn](docs/rules/prefer-bun-spawn.md) | `spawn()` / `spawnSync()` → Bun subprocess APIs | warn | warn | warn |

All three presets are identical in 0.1.0. `strict` will add opinionated conventions; `all` will include every stable rule. Experimental rules will remain opt-in. To enforce a rule, override its severity after the preset, for example `{ rules: { "bun/prefer-bun-file": "error" } }`.

Named imports, aliases, namespace/default imports, `node:` and bare builtin specifiers, direct `require()` calls, and `const` CommonJS bindings are recognized. Shadowed bindings and visible reassignments are excluded. Dynamic imports, indirect aliases, arbitrary object mutations and data-flow analysis are outside 0.1.0's scope. Importing a function without calling it does not report.

## Oxlint

This is an ESLint plugin, but it is also tested against Oxlint. It would be cool if you used Oxlint for it.

Install the tarball and `oxlint`; ESLint is an optional peer and isn't needed for Oxlint-only use. Configure the namespace explicitly:

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

Run `bunx oxlint`. Oxlint's [JavaScript plugin API](https://oxc.rs/docs/guide/usage/linter/js-plugins.html) is currently alpha; the locked version is covered by a dedicated CI job and the same JS/TS fixtures used for ESLint.

## Compatibility

- Target application runtime: **Bun >=1.4.0**.
- Linter: **ESLint >=9 <11**, or Oxlint with JavaScript plugin support (tested with 1.85.0).
- Plugin execution: ordinary ESM JavaScript, **Node >=18.18.0**; no Bun globals or production dependencies. Your ESLint version may require a newer Node (ESLint 10 needs Node 20.19+, 22.13+, or 24+).
- JavaScript and TypeScript syntax supported without type information. TypeScript parser is a development dependency only.
- No autofixes or suggestions in 0.1.0: callback behavior, buffers, encoding, flags and subprocess options need manual review.

## Development and roadmap

See [CONTRIBUTING.md](CONTRIBUTING.md), the [testing record](docs/testing.md), and the [roadmap issue index](docs/roadmap.md). New rules ship one per minor release before 1.0; fixes use patch versions. The first release deliberately contains only the three rules above.

MIT © Dave Lunny
