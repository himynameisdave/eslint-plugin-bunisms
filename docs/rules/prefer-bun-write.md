# bun/prefer-bun-write

## What it does

Recognizes `writeFile()` from `fs` and `fs/promises`, including `fs.promises.writeFile()`. It does not report `appendFile`, `writeFileSync`, streams or other filesystem operations.

Named, aliased, default and namespace imports are supported, with either bare or `node:` module names. CommonJS direct calls and `const` require bindings (including destructuring) are supported. Lexical shadowing and visible binding/module-property mutations suppress reports. Dynamic imports, indirect aliases, mutable CommonJS declarations and interprocedural mutation tracking are not supported.

## Why

Bun.write accepts strings, binary data, blobs and responses for Bun-native file writes.

## Incorrect

```js
import { writeFile } from "node:fs/promises";
await writeFile("hello.txt", "Hello!");
```

These examples are valid Node-compatible code; the rule recommends a Bun-specific alternative when the file targets Bun.

## Preferred

```js
await Bun.write("hello.txt", "Hello!");
```

## When not to use it

Keep Node APIs in shared Node/Bun code or where callback, encoding, permissions, flags, abort signals or file-descriptor semantics are needed. Bun.write returns a byte count; Node writeFile does not. Review options and error handling before migrating. Callback calls remain advisory reports.

Disable the rule for such files or scope the preset to Bun-only code. Only actual calls report; unused imports or function references do not.

## Options

None. All three presets enable this rule as a warning in 0.1.0.

## Suggestions / autofix behavior

Diagnostic only. There are no editor suggestions or automatic fixes. The diagnostic names the exact Bun alternative (Bun.write()).

## Bun compatibility

Targets Bun >=1.4.0. Bun is not required to execute the plugin; ESLint can run under Node.

## References

- [Official Bun API documentation](https://bun.sh/docs/runtime/file-io)
- [Node API documentation](https://nodejs.org/api/fs.html)
