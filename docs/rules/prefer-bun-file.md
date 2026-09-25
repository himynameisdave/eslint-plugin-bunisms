# bun/prefer-bun-file

## What it does

Recognizes `readFile()` from `fs` and `fs/promises`, including `fs.promises.readFile()`. It does not report `readFileSync`, streams, directory operations, or unrelated functions.

Named, aliased, default and namespace imports are supported, with either bare or `node:` module names. CommonJS direct calls and `const` require bindings (including destructuring) are supported. Lexical shadowing and visible binding/module-property mutations suppress reports. Dynamic imports, indirect aliases, mutable CommonJS declarations and interprocedural mutation tracking are not supported.

## Why

Bun files expose text, JSON, binary and streaming readers without requiring the Node filesystem API.

## Incorrect

```js
import { readFile as read } from 'node:fs/promises';
const text = await read('hello.txt', 'utf8');
```

These examples are valid Node-compatible code; the rule recommends a Bun-specific alternative when the file targets Bun.

## Preferred

```js
const text = await Bun.file('hello.txt').text();
const bytes = await Bun.file('hello.bin').arrayBuffer();
```

## When not to use it

Keep Node APIs when the module must also run under Node, when callback behavior is required, or when encodings/options or file descriptors need Node-specific handling. `Bun.file()` creates a lazy file object; reading requires `.text()`, `.json()`, `.arrayBuffer()` or another reader. Its binary result is not automatically a Node Buffer. Callback calls are advisory reports, not drop-in replacements.

Disable the rule for such files or scope the preset to Bun-only code. Only actual calls report; unused imports or function references do not.

## Options

None. All three presets enable this rule as a warning in 0.1.0.

## Suggestions / autofix behavior

Diagnostic only. There are no editor suggestions or automatic fixes. The diagnostic names the exact Bun alternative (Bun.file()).

## Bun compatibility

Targets Bun >=1.4.0. Bun is not required to execute the plugin; ESLint can run under Node.

## References

- [Official Bun API documentation](https://bun.sh/docs/runtime/file-io)
- [Node API documentation](https://nodejs.org/api/fs.html)
