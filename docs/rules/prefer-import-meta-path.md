# bun/prefer-import-meta-path

Prefer Bun's `import.meta.path` when converting the current module URL to a filesystem path.

## Incorrect

```ts
import { fileURLToPath } from 'node:url';

const path = fileURLToPath(import.meta.url);
```

## Preferred

```ts
const path = import.meta.path;
```

Bun exposes `import.meta.path` as the absolute path of the current module. It is the path equivalent of `import.meta.url`, which is a `file:` URL. Use this rule only for code that runs on Bun.

The rule recognizes direct `fileURLToPath` imports from `url` or `node:url`, including aliases, namespace/default imports, and CommonJS `require()` bindings. It reports only a call with exactly one argument whose expression is `import.meta.url`. It does not report other file URLs, computed properties, shadowed bindings, type-only imports, or unrelated functions with the same name. It does not use TypeScript type information.

## When not to use it

Do not enable this rule for files that also run in Node.js or another runtime. `import.meta.path` is a Bun-specific property. The rule does not suggest a fix because replacing the expression can require changing imports and may be inappropriate for shared-runtime code.

## Options

This rule has no options.

## Bun compatibility

The plugin targets Bun 1.4.0 and later. Bun's current documentation describes `import.meta.path` as the absolute path to the current file and `import.meta.url` as its file URL.

- [Bun `import.meta` documentation](https://bun.sh/docs/runtime/module-resolution#importmeta)
- [Bun `fileURLToPath` utility](https://bun.sh/docs/runtime/utils#bunfileurltopath)
