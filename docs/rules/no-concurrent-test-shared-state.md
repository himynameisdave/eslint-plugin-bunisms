# no-concurrent-test-shared-state

📝 Warn about direct writes to file-level variables in concurrent Bun tests.

⚠️ This experimental rule is **opt-in only** and is excluded from all [configs](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint), including `all`.

Bun's [concurrent tests](https://bun.com/docs/test#concurrent-test-execution) share state within a file and can overlap while awaiting. Keeping mutable state inside each test avoids interference. This rule reports assignments, updates (`++`/`--`), destructuring assignments and `for…in`/`for…of` writes to variables declared in the file's module scope (or top-level CommonJS scope), directly inside an inline `test.concurrent()` or `it.concurrent()` callback. Named imports, import aliases, namespace imports and direct CommonJS `bun:test` bindings are recognized, including static computed properties, `.only`/`.failing` chains and `.concurrent.each()`.

The analysis is deliberately narrow: it ignores callback-local and shadowed bindings, imported state, unbound globals, property mutations, mutating methods, helpers, nested functions/classes, indirect callbacks and suite-local variables. It does not infer concurrency from `describe.concurrent`, CLI flags or configuration. Conditional qualifiers and chains containing `.serial`, `.skip`, `.todo` or unknown properties are excluded. No TypeScript type information is required.

A report identifies shared state, not a proven race; even synchronous writes are reported. Nested synchronization callbacks and `Atomics` calls are outside the analysis, but locks acquired directly in the callback cannot be verified. Keep this rule disabled for deliberately coordinated shared state, or use a targeted lint suppression after review. When tests must share state sequentially, consider [`test.serial`](https://bun.com/docs/test#testserial); moving a binding into the callback changes its lifetime and may require restructuring setup and cleanup. There are no options, autofixes or suggestions. Supports Bun **1.4.0+**; runtime checks on 1.4.0 and 1.4.2 and the initial dogfood scope are recorded in [testing](../testing.md#no-concurrent-test-shared-state-validation).

Enable explicitly after a preset:

```ts
export default [bun.configs.recommended, { rules: { 'bun/no-concurrent-test-shared-state': 'warn' } }];
```

## Examples

```ts
// ❌ Shared across concurrent tests.
import { test } from 'bun:test';
let counter = 0;
test.concurrent('one', () => {
  counter++;
});
```

```ts
// ✅ Each callback owns its mutable state.
import { test } from 'bun:test';
test.concurrent('one', () => {
  let counter = 0;
  counter++;
});
```

```ts
// ✅ Explicit sequential execution when state must be shared.
import { test } from 'bun:test';
let counter = 0;
test.serial('one', () => {
  counter++;
});
```
