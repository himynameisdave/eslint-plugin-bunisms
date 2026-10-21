# prefer-mock-restore-in-after-each

📝 Restore Bun mocks in an `afterEach` hook to isolate tests.

⚠️ This rule _warns_ in the following [configs](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint): 🔒 `strict`, 🌐 `all`.

Bun's [`mock.restore()`](https://bun.sh/docs/test/mocks#restore-all-mocks) restores spies and mocks after a test. It does not reset modules replaced with `mock.module()`. The rule reports `spyOn()` calls from `bun:test` made in a test, a `beforeEach` hook or a helper function when no applicable `afterEach` hook calls `mock.restore()`.

It skips a spy stored in a variable whose own `mockRestore()` is called anywhere, such as in a `finally` block. It also skips spies made at module level, directly in a `describe` body or in `beforeAll`: those are shared across tests, and an `afterEach` restore would undo them after the first test.

Named, aliased, namespace and CommonJS `bun:test` bindings are recognized, along with Bun's unshadowed `describe`, `xdescribe`, `beforeAll`, `afterEach`, `jest` and `vi` globals. Cleanup in a parent `describe` scope, including modifiers such as `describe.only` and `describe.each`, applies to nested scopes; cleanup in a sibling scope does not. Only direct `mock.restore()`, `jest.restoreAllMocks()`, `vi.restoreAllMocks()` or `spy.mockRestore()` calls inside an `afterEach` callback count as hook cleanup; any `mockRestore()` call there counts for every spy in scope. The rule does not insert hooks or offer a fix because hook placement and shared mock state need project-specific review. It does not analyze indirect aliases or callback behavior.

Keep the rule disabled when cleanup is managed by a preload or another runner mechanism.

## Examples

```js
// ❌
import { spyOn, test } from 'bun:test';
test('fetches', () => {
  spyOn(service, 'fetch');
});

// ✅
import { afterEach, mock, spyOn, test } from 'bun:test';
afterEach(() => mock.restore());
test('fetches', () => {
  spyOn(service, 'fetch');
});

// ✅
import { spyOn, test } from 'bun:test';
test('fetches', () => {
  const fetch = spyOn(service, 'fetch');
  try {
    run();
  } finally {
    fetch.mockRestore();
  }
});
```
