# prefer-bun-file

📝 Prefer `Bun.file()` over the corresponding Node.js APIs.

⚠️ This rule _warns_ in the following [configs](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint): ✅ `recommended`, 🔒 `strict`, 🌐 `all`.

[`Bun.file()`](https://bun.sh/docs/runtime/file-io) exposes text, JSON, binary and streaming readers without needing the Node filesystem API.

This rule reports [`readFile()`](https://nodejs.org/api/fs.html) from `fs` and `fs/promises`, including `fs.promises.readFile()`. It does not report `readFileSync`, streams, directory operations or unrelated functions.

Named, aliased, default and namespace imports are supported, with either bare or `node:` module names. CommonJS direct calls and `const` require bindings (including destructuring) are supported. Lexical shadowing and visible binding/module-property mutations suppress reports. Dynamic imports, indirect aliases, mutable CommonJS declarations and interprocedural mutation tracking are not supported. Only actual calls report; unused imports or function references do not.

The rule reports without a fix, because the APIs are not drop-in replacements. `Bun.file()` creates a lazy file object; reading requires `.text()`, `.json()`, `.arrayBuffer()` or another reader, and its binary result is not a Node `Buffer`. Keep the Node API when the module must also run under Node, when callback behavior is required, or when encodings, options or file descriptors need Node-specific handling. Disable the rule for such files or scope the preset to Bun-only code.

## Examples

```js
// ❌
import { readFile } from 'node:fs/promises';
const text = await readFile('hello.txt', 'utf8');

// ✅
const text = await Bun.file('hello.txt').text();
```

```js
// ❌
import fs from 'node:fs';
const bytes = await fs.promises.readFile('hello.bin');

// ✅
const bytes = await Bun.file('hello.bin').arrayBuffer();
```

```js
// ❌
const { readFile } = require('fs/promises');
const config = JSON.parse(await readFile('config.json', 'utf8'));

// ✅
const config = await Bun.file('config.json').json();
```

```js
// ✅
import { readFileSync } from 'node:fs';
const text = readFileSync('hello.txt', 'utf8');
```
