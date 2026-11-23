# no-concurrent-test-shared-state

📝 Warn about direct writes to file-level variables in concurrent Bun tests.

⚠️ This experimental rule is _off_ in every [config](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint), including 🌐 `all`. Enable it with `'bun/no-concurrent-test-shared-state': 'warn'`.

Bun's [concurrent tests](https://bun.com/docs/test#concurrent-test-execution) share file state and can overlap while awaiting, so mutable state belongs inside each test. The rule reports assignments, updates, destructuring and `for…in`/`for…of` writes to file-level variable, function or class bindings made directly in an inline `test.concurrent()` or `it.concurrent()` callback, including class static blocks, static fields, computed keys and `extends` evaluated there. It recognizes named, aliased, namespace and CommonJS `bun:test` bindings, Bun's unshadowed `test` and `it` globals, `.only`/`.failing` chains and `.concurrent.each()` with a table or template.

It ignores callback-local and shadowed bindings, imports, property writes, mutating methods, helpers, nested functions, methods, instance fields, indirect callbacks and suite-local variables. It does not infer concurrency from `describe.concurrent`, CLI flags or configuration, and skips conditional qualifiers and chains with `.serial`, `.skip`, `.todo` or unknown properties.

A report flags shared state, not a proven race, and locks taken in the callback cannot be verified. Keep the rule off for deliberately coordinated state, or suppress a reviewed report. Use [`test.serial`](https://bun.com/docs/test#testserial) when tests must share state in order. There are no options, fixes or suggestions. Supports Bun **1.4.0+**; validation is recorded in [testing](../testing.md#no-concurrent-test-shared-state-validation).

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
