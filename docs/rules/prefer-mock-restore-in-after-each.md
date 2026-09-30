# prefer-mock-restore-in-after-each

📝 Restore Bun mocks in an `afterEach` hook to isolate tests.

⚠️ This rule _warns_ in the following [configs](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint): 🔒 `strict`, 🌐 `all`.

Bun's [`mock.restore()`](https://bun.sh/docs/test/mocks#restore-all-mocks) restores spies and mocks after a test. It does not reset modules replaced with `mock.module()`. The rule reports `spyOn()` calls from `bun:test` when no applicable `afterEach` hook calls `mock.restore()`.

Named, aliased, namespace, default and CommonJS `bun:test` bindings are recognized, along with Bun's unshadowed test globals. Cleanup in a parent `describe` scope applies to nested scopes; cleanup in a sibling scope does not. Only direct `mock.restore()` calls inside an `afterEach` callback count. The rule does not insert hooks or offer a fix because hook placement and shared mock state need project-specific review. It does not analyze indirect aliases or callback behavior.

Keep the rule disabled when tests intentionally share spies across cases or when cleanup is managed by a preload or another runner mechanism. `mock.restore()` does not remove `mock.module()` overrides.

## Examples

```js
// ❌
import { spyOn } from 'bun:test';
spyOn(service, 'fetch');

// ✅
import { afterEach, mock, spyOn } from 'bun:test';
afterEach(() => mock.restore());
spyOn(service, 'fetch');
```
