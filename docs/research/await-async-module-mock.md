# Async `mock.module()` research

Issue: [bun/await-async-module-mock](https://github.com/himynameisdave/eslint-plugin-bunisms/issues/7).

The [Bun mocking documentation](https://bun.com/docs/test/mocks#overriding-already-imported-modules) says that a pending async factory can make `mock.module()` return a promise, and recommends awaiting the call inside a test or hook. It also says that Bun waits for pending top-level mocks before running tests and evaluates factories lazily when the module is imported or required.

`node scripts/research-async-module-mock.mjs` isolates the relevant cases in child `bun test` processes. On Bun 1.4.2 (macOS ARM64):

| Case                                                      | Observed result                                                                                           |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Async factory, module not previously imported             | `mock.module()` returns `undefined`; later dynamic import receives the mock.                              |
| Async factory with no suspension, module already imported | `mock.module()` returns `undefined`; the binding updates synchronously.                                   |
| Async factory that suspends, module already imported      | `mock.module()` does not return; the child process times out. `await mock.module()` has the same outcome. |

The last case also matches [Bun issue #40007](https://github.com/oven-sh/bun/issues/40007), which reports a loader hang for a suspending async factory and a statically imported module. The local reproduction also hangs after a dynamic import inside the test.

This does not establish a safe `recommended` diagnostic for the plugin's Bun >=1.4.0 baseline. In the lazy case, there is no returned promise to await. In the already imported case, awaiting cannot repair the hang because control never returns from `mock.module()`. Keep issue #7 open and defer the rule until Bun's behavior is fixed or a narrower, runtime-verified pattern emerges. Do not increase the minimum Bun version silently. Rerun the script on a future Bun version before revisiting the rule or its preset membership.
