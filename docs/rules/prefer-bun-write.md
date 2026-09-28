# prefer-bun-write

📝 Prefer `Bun.write()` over the corresponding Node.js APIs.

⚠️ This rule _warns_ in the following [configs](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint): ✅ `recommended`, 🔒 `strict`, 🌐 `all`.

[`Bun.write()`](https://bun.sh/docs/runtime/file-io) accepts strings, binary data, blobs and responses for Bun-native file writes.

This rule reports [`writeFile()`](https://nodejs.org/api/fs.html) from `fs` and `fs/promises`, including `fs.promises.writeFile()`. It does not report `appendFile`, `writeFileSync`, streams or other filesystem operations.

Named, aliased, default and namespace imports are supported, with either bare or `node:` module names. CommonJS direct calls and `const` require bindings (including destructuring) are supported. Lexical shadowing and visible binding/module-property mutations suppress reports. Dynamic imports, indirect aliases, mutable CommonJS declarations and interprocedural mutation tracking are not supported. Only actual calls report; unused imports or function references do not.

The rule reports without a fix, because the APIs are not drop-in replacements. `Bun.write()` returns a byte count; Node's `writeFile()` does not. Keep the Node API in shared Node/Bun code, or where callback, encoding, permissions, flags, abort signals or file-descriptor semantics are needed. Review options and error handling before migrating. Disable the rule for such files or scope the preset to Bun-only code.

## Examples

```js
// ❌
import { writeFile } from 'node:fs/promises';
await writeFile('hello.txt', 'Hello!');

// ✅
await Bun.write('hello.txt', 'Hello!');
```

```js
// ❌
import fs from 'node:fs';
await fs.promises.writeFile('data.json', JSON.stringify(data));

// ✅
await Bun.write('data.json', JSON.stringify(data));
```

```js
// ❌
const { writeFile: save } = require('fs/promises');
await save('hello.txt', 'Hello!');

// ✅
await Bun.write('hello.txt', 'Hello!');
```

```js
// ✅
import { appendFile } from 'node:fs/promises';
await appendFile('log.txt', 'Hello!\n');
```
