# bun/prefer-import-meta-dir

Prefer `import.meta.dir` for the current module directory. Enabled as a warning in `recommended`, `strict`, and `all`.

## Behavior and rationale

Bun exposes the absolute directory of the current module directly. Report a direct `dirname(fileURLToPath(import.meta.url))` call when both functions resolve to the `path` and `url` built-ins. The containing variable's name does not matter; declarations of and assignments to `__dirname` are included.

Incorrect for Bun-only code:

```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
```

Preferred:

```js
const __dirname = import.meta.dir;
```

Supports named imports and import aliases, namespace/default imports, bare and `node:` specifiers, and direct unshadowed `require` calls or `const` require bindings within modules. JavaScript and TypeScript use the same binding analysis without type information.

## Boundaries

Unrelated functions, shadowed bindings, type-only imports, reassigned bindings and visibly mutated module objects do not report. Neither do arbitrary paths, URLs other than the direct `import.meta.url`, extra arguments (including `fileURLToPath` platform options), optional calls, `path.posix`/`path.win32`, computed `import.meta['url']`, or indirect filename variables. Arbitrary data flow, monkey-patching through aliases and custom loader behavior are not analyzed.

## Options

None.

## Fix policy

Diagnostic only: no automatic fix or editor suggestion. Review runtime requirements and remove unused imports manually. Keeping this rule diagnostic-only prevents overlapping edits with the `prefer-import-meta-path` rule; its nested conversion is independently reported by that rule without conflicting fixes.

## Compatibility and when not to use it

Targets Bun >=1.4.0 without raising the project's baseline. Disable it for code shared with Node or browsers, or code relying on custom module loaders or mutated `import.meta` properties. Runtime regression coverage checks normal file modules, spaces, URL-reserved characters, Unicode and symlink entry points. Bundled and compiled executables require separate migration review.

Official references:

- [Bun module metadata](https://bun.sh/docs/runtime/module-resolution): directory and URL refer to the current module.
- [Bun directory guide](https://bun.sh/guides/util/import-meta-dir): direct directory access.
- [Node fileURLToPath](https://nodejs.org/api/url.html#urlfileurltopathurl-options): decoding and platform-specific conversion options.

See [the testing record](../testing.md) for validation and release caveats.
