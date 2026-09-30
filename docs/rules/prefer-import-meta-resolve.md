# prefer-import-meta-resolve

📝 Consider import.meta.resolve for module resolution in Bun ESM.

⚠️ This rule _warns_ in the following [configs](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint): 🔒 `strict`, 🌐 `all`.

[`import.meta.resolve()`](https://bun.com/docs/runtime/module-resolution#importmeta) provides module-relative resolution using ESM syntax on Bun >=1.4.0. This rule reports direct global `require.resolve()` calls with one nonempty string literal argument, including `require['resolve']()`. It skips files parsed as CommonJS, `.cjs`/`.cts` files, and files that reference unshadowed `module` or `exports` (including `typeof exports`), use `require.main`, or use TypeScript `export =` or `import x = require()`. Files parsed as scripts are still checked, so ESLint and Oxlint agree: Oxlint parses `.js`/`.ts` files without `import`/`export` as scripts.

Shadowed or imported `require` bindings, `createRequire()` bindings, aliases, optional calls, dynamic specifiers and calls with lookup options are excluded. Direct assignments, updates or deletions affecting global `require` or its properties, including through TypeScript `as`, `!`, `satisfies` or `<T>` casts, suppress reports in that file; mutations through aliases or other functions are not tracked. Specifiers containing `#`, `?` or `%` are excluded: Bun 1.4.0–1.4.2 does not safely URL-escape all reserved filename characters during resolution.

There is no automatic fix or editor suggestion. File resolutions return a URL instead of a filesystem path, built-ins can gain a `node:` prefix, and conditional exports can select the `import` entry instead of the `require` entry. Review the [Bun resolution conditions](https://bun.com/docs/runtime/module-resolution#importing-packages) and [Node `require.resolve()` lookup options](https://nodejs.org/api/modules.html#requireresolverequest-options). This rule identifies migration candidates, not equivalent replacements; it does not inspect package exports or consumers of the result. Keep `require.resolve()` when you need a filesystem path, CommonJS resolution conditions, custom lookup paths, or CommonJS compatibility. Scope the rule to Bun ESM files; a linter's module setting does not inspect the surrounding package's runtime format.

## Examples

```js
// ❌
const resolved = require.resolve('some-package');

// ✅ After checking the package's import entry and URL-compatible consumer
const resolved = import.meta.resolve('some-package');
```

```js
// ✅ Custom lookup roots are not an equivalent migration
const resolved = require.resolve('some-package', { paths: ['/another/project'] });

// ✅ Locally created resolvers can have a different resolution base
import { createRequire } from 'node:module';
const require = createRequire('/another/project/entry.js');
const resolved = require.resolve('some-package');
```
