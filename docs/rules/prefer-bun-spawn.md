# prefer-bun-spawn

📝 Prefer `Bun.spawn()` or `Bun.spawnSync()` over the corresponding Node.js APIs.

⚠️ This rule _warns_ in the following [configs](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint): ✅ `recommended`, 🔒 `strict`, 🌐 `all`.

[`Bun.spawn()` and `Bun.spawnSync()`](https://bun.sh/docs/runtime/child-process) integrate with Bun streams and offer asynchronous and synchronous process execution.

This rule reports [`spawn()` and `spawnSync()`](https://nodejs.org/api/child_process.html) from `child_process`. It does not report `exec`, `execSync` or `fork`; shell migration belongs to a future separate rule.

Named, aliased, default and namespace imports are supported, with either bare or `node:` module names. CommonJS direct calls and `const` require bindings (including destructuring) are supported. Lexical shadowing and visible binding/module-property mutations suppress reports. Dynamic imports, indirect aliases, mutable CommonJS declarations and interprocedural mutation tracking are not supported. Only actual calls report; unused imports or function references do not.

The rule reports without a fix, because the APIs are not drop-in replacements: argument shapes, return objects, signals, buffering and error handling differ. Keep the Node API in cross-runtime tools, or where Node `ChildProcess` events, IPC or specific stdio/options semantics are required. Disable the rule for such files or scope the preset to Bun-only code.

## Examples

```js
// ❌
import { spawn } from 'node:child_process';
spawn('echo', ['hello']);

// ✅
const child = Bun.spawn(['echo', 'hello']);
await child.exited;
```

```js
// ❌
import * as cp from 'node:child_process';
cp.spawnSync('echo', ['hello']);

// ✅
const result = Bun.spawnSync(['echo', 'hello']);
```

```js
// ❌
const { spawn: run } = require('child_process');
run('echo', ['hello']);

// ✅
const child = Bun.spawn(['echo', 'hello']);
```

```js
// ✅
import { exec } from 'node:child_process';
exec('echo hello');
```
