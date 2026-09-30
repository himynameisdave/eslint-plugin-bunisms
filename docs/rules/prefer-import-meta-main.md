# prefer-import-meta-main

📝 Prefer `import.meta.main` to check whether this module is the entrypoint.

⚠️ This rule _warns_ in the following [configs](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint): ✅ `recommended`, 🔒 `strict`, 🌐 `all`.

[`import.meta.main`](https://bun.sh/guides/util/entrypoint) is `true` when the current module is the entrypoint, so there is no need to compare paths or CommonJS globals.

This rule reports `===`, `==`, `!==` and `!=` comparisons between `require.main` and the `module` global, or between [`import.meta.path`](https://bun.sh/docs/runtime/module-resolution#import-meta) and [`Bun.main`](https://bun.sh/docs/runtime/utils#bun-main). Either operand order and string-literal computed properties (`require['main']`) are supported. The report covers the whole comparison. It does not report aliases, `createRequire`, namespace or default imports from `bun`, other property keys, optional chains or other path and URL comparisons.

Parameters, local declarations and imports named `require`, `module` or `Bun` are ignored, including hoisted declarations. Lexical scope is used; no type information is needed. Mutation of the compared values is not analyzed.

The rule reports without a fix, because inequality checks need their negation kept by hand. Keep the Node pattern in code that must also run under Node, or that relies on custom module loaders, bundlers, workers or mutated globals. Bun accepts `import.meta` in CommonJS sources, but migrating changes portability to other runtimes and tooling. Disable the rule for such files or scope the preset to Bun-only code. See [the testing record](../testing.md#prefer-import-meta-main-validation) for validation and release caveats.

## Examples

```js
// ❌
if (require.main === module) start();

// ✅
if (import.meta.main) start();
```

```js
// ❌
if (Bun.main === import.meta.path) start();

// ✅
if (import.meta.main) start();
```

```js
// ❌
if (module !== require.main) register();

// ✅
if (!import.meta.main) register();
```

```js
// ✅
function check(require, module) {
  return require.main === module;
}
```
