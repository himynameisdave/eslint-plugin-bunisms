# prefer-import-meta-path

📝 Prefer `import.meta.path` to convert the current module URL to a filesystem path.

⚠️ This rule _warns_ in the following [configs](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint): ✅ `recommended`, 🔒 `strict`, 🌐 `all`.

[`import.meta.path`](https://bun.sh/docs/runtime/module-resolution#importmeta) is the absolute path of the current module, the path equivalent of the `file:` URL in `import.meta.url`.

This rule reports [`fileURLToPath()`](https://nodejs.org/api/url.html#urlfileurltopathurl-options) from `url` when called with exactly one argument, `import.meta.url`. It does not report other file URLs, extra arguments, computed properties or unrelated functions with the same name.

Named, aliased, default and namespace imports are supported, with either bare or `node:` module names. CommonJS direct calls and `const` require bindings (including destructuring) are supported. Lexical shadowing and type-only imports suppress reports. No type information is used.

The rule reports without a fix, because replacing the expression can require changing imports and may be wrong for shared-runtime code. `import.meta.path` is Bun-specific. Keep the Node API in files that also run in Node.js or another runtime. Disable the rule for such files or scope the preset to Bun-only code.

## Examples

```js
// ❌
import { fileURLToPath } from 'node:url';
const path = fileURLToPath(import.meta.url);

// ✅
const path = import.meta.path;
```

```js
// ❌
import * as url from 'node:url';
const file = url.fileURLToPath(import.meta.url);

// ✅
const file = import.meta.path;
```

```js
// ❌
const { fileURLToPath: toPath } = require('url');
const file = toPath(import.meta.url);

// ✅
const file = import.meta.path;
```

```js
// ✅
import { fileURLToPath } from 'node:url';
const other = fileURLToPath(new URL('./data.json', import.meta.url));
```
