# no-late-module-mock

📝 Warn when a statically imported module is mocked after it can run side effects.

⚠️ This rule _warns_ in the following [configs](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint): 🔒 `strict`, 🌐 `all`.

ES module imports run before the test file's code. Bun's [`mock.module()`](https://bun.com/docs/test/mocks#overriding-already-imported-modules) can update live ESM bindings and CommonJS exports after an import, but it cannot undo side effects from the original module. If the original module must not run, [preload the mock](https://bun.com/docs/test/mocks#hoisting-preloading) or import the target dynamically after calling `mock.module()`.

This rule reports a `mock.module()` or `vi.mock()` call from a named or namespace `bun:test` import or a direct CommonJS `require('bun:test')` binding when the same file has a runtime static import, re-export or TypeScript `import x = require()` with the **exact same** string specifier. It checks imports anywhere in the file because their evaluation precedes the test file's code. Type-only imports and re-exports, TypeScript imports whose bindings are unused or only used as types (Bun drops them), dynamic imports, shadowed or unrelated `mock` objects, computed specifiers, and different strings are excluded. It does not resolve extension aliases, relative paths or `node:` prefixes; review those cases manually. A preload may already have replaced the module before this file runs, so a report does not prove that the original module ran.

There is no autofix or suggestion: moving imports can change evaluation order, and dynamic imports make callers asynchronous. Keep deliberate late mocks when replacing bindings after original initialization is intentional. Use this rule with Bun 1.4.0 or later; the behavior is documented in Bun's [module mock best practices](https://bun.com/docs/test/mocks#module-mock-best-practices) and [import timing effects](https://bun.com/docs/test/mocks#import-timing-effects).

## Examples

```ts
// ❌ Original side effects can run before this mock.
import { foo } from './foo';
import { mock } from 'bun:test';
mock.module('./foo', () => ({ foo: replacement }));

// ✅ Preload a mock before the test imports ./foo, or use a dynamic import.
import { mock } from 'bun:test';
mock.module('./foo', () => ({ foo: replacement }));
const { foo } = await import('./foo');
```

```ts
// ✅ A different module is mocked.
import { foo } from './foo';
import { mock } from 'bun:test';
mock.module('./other', () => ({ foo: replacement }));
```
