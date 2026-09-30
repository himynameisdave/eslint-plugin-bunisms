# prefer-bun-shell

📝 Prefer Bun Shell for shell-oriented process execution.

⚠️ This rule _warns_ in the following [configs](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint): 🔒 `strict`, 🌐 `all`.

[Bun Shell](https://bun.sh/docs/runtime/shell) provides a cross-platform shell API using the `$` tagged template literal. Interpolated values are escaped by default. It is available in the project's supported Bun baseline, Bun >=1.4.0.

This rule reports `exec()` and `execSync()` from `child_process`, including named, aliased, default and namespace imports and supported CommonJS bindings. Bare and `node:` module specifiers are recognized. It does not report `spawn()`, `spawnSync()`, `execFile()` or unrelated functions. Shadowed bindings, type-only imports and visible mutations are excluded. Only direct calls report; passing `exec` to `promisify()` or another function does not.

There is no automatic fix or suggestion. Do not interpolate an arbitrary command string or assume Bun Shell has identical shell syntax, platform behavior, callback timing, output buffering or exit-status handling. Review the [Bun Shell](https://bun.sh/docs/runtime/shell) and [Node child process](https://nodejs.org/api/child_process.html#child_processexeccommand-options-callback) documentation when migrating. Bun Shell is async; for `execSync()` in code that cannot `await`, use [`Bun.spawnSync()`](https://bun.sh/docs/runtime/child-process). Keep `exec()` when Node compatibility or its callback/options semantics are required.

## Examples

```js
// ❌
import { exec } from 'node:child_process';
exec('echo hello');

// ✅
import { $ } from 'bun';
await $`echo hello`;
```

```js
// ❌
import { execSync } from 'child_process';
const output = execSync('git status --short');

// ✅
import { $ } from 'bun';
const output = await $`git status --short`.text();

// ✅ In synchronous code
const output = Bun.spawnSync(['git', 'status', '--short']).stdout.toString();
```

```js
// ✅
import { execFile } from 'node:child_process';
execFile('echo', ['hello']);
```
