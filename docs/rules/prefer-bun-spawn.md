# bun/prefer-bun-spawn

## What it does

Recognizes `spawn()` and `spawnSync()` calls from `child_process`. It does not report `exec`, `execSync` or `fork`; shell migration belongs to a future separate rule.

Named, aliased, default and namespace imports are supported, with either bare or `node:` module names. CommonJS direct calls and `const` require bindings (including destructuring) are supported. Lexical shadowing and visible binding/module-property mutations suppress reports. Dynamic imports, indirect aliases, mutable CommonJS declarations and interprocedural mutation tracking are not supported.

## Why

Bun subprocess APIs integrate with Bun streams and offer asynchronous and synchronous process execution.

## Incorrect

```js
import { spawn, spawnSync } from 'node:child_process';
spawn('echo', ['hello']);
spawnSync('echo', ['hello']);
```

These examples are valid Node-compatible code; the rule recommends a Bun-specific alternative when the file targets Bun.

## Preferred

```js
const child = Bun.spawn(['echo', 'hello']);
await child.exited;
const result = Bun.spawnSync(['echo', 'hello']);
```

## When not to use it

Keep Node APIs in cross-runtime tools or where Node ChildProcess events, IPC or specific stdio/options semantics are required. Argument shapes, return objects, signals, buffering and error handling differ. This is a migration prompt, not evidence that Node subprocess APIs are incorrect.

Disable the rule for such files or scope the preset to Bun-only code. Only actual calls report; unused imports or function references do not.

## Options

None. All three presets enable this rule as a warning in 0.1.0.

## Suggestions / autofix behavior

Diagnostic only. There are no editor suggestions or automatic fixes. The diagnostic names the exact Bun alternative (Bun.spawn() / Bun.spawnSync()).

## Bun compatibility

Targets Bun >=1.4.0. Bun is not required to execute the plugin; ESLint can run under Node.

## References

- [Official Bun API documentation](https://bun.sh/docs/runtime/child-process)
- [Node API documentation](https://nodejs.org/api/child_process.html)
