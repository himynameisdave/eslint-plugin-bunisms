# prefer-import-meta-dir

📝 Prefer `import.meta.dir` for the current module directory.

⚠️ This rule _warns_ in the following [configs](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint): ✅ `recommended`, 🔒 `strict`, 🌐 `all`.

[`import.meta.dir`](https://bun.sh/guides/util/import-meta-dir) is the absolute directory of the current module, so there is no need to build it from `import.meta.url`.

This rule reports a direct [`dirname(fileURLToPath(import.meta.url))`](https://nodejs.org/api/url.html#urlfileurltopathurl-options) call when both functions resolve to the `path` and `url` built-ins. The containing variable's name does not matter; declarations of and assignments to `__dirname` are included. It does not report arbitrary paths, URLs other than the direct `import.meta.url`, extra arguments (including `fileURLToPath` platform options), optional calls, `path.posix`/`path.win32`, computed `import.meta['url']` or indirect filename variables.

Named, aliased, default and namespace imports are supported, with either bare or `node:` module names. CommonJS direct calls and `const` require bindings are supported. Lexical shadowing, type-only imports and visible binding/module-property mutations suppress reports. Arbitrary data flow, monkey-patching through aliases and custom loader behavior are not analyzed. No type information is used.

The rule reports without a fix; review runtime requirements and remove unused imports manually. Staying diagnostic-only avoids overlapping edits with [`prefer-import-meta-path`](./prefer-import-meta-path.md), which reports the nested `fileURLToPath(import.meta.url)` call independently. Keep the Node pattern in code shared with Node or browsers, or code relying on custom module loaders or mutated `import.meta` properties. Bundled and compiled executables need separate migration review. Disable the rule for such files or scope the preset to Bun-only code. See [the testing record](../testing.md) for validation and release caveats.

## Examples

```js
// ❌
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));

// ✅
const __dirname = import.meta.dir;
```

```js
// ❌
import path from 'node:path';
import * as url from 'node:url';
const root = path.dirname(url.fileURLToPath(import.meta.url));

// ✅
const root = import.meta.dir;
```

```js
// ❌
const { dirname } = require('path');
const { fileURLToPath } = require('url');
const dir = dirname(fileURLToPath(import.meta.url));

// ✅
const dir = import.meta.dir;
```

```js
// ✅
import { dirname } from 'node:path';
const parent = dirname('/tmp/file.txt');
```
