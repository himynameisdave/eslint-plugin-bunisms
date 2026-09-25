# Contributing

Use Bun 1.4.2 and Node 22 for development. Bun builds the plugin and runs unit tests; Node runs the built plugin to verify portability.

```sh
bun install --frozen-lockfile
bun run check
```

`check` runs types, Oxlint, Oxfmt formatting checks, RuleTester against ESLint 9 and 10, the build, Node tests, Oxlint's shared fixture suite, and an isolated npm tarball installation. The package smoke test needs npm registry access and leaves `eslint-plugin-bunisms-0.1.0.tgz` for local consumer testing. It verifies the optional ESLint peer before installing consumer tooling. `ESLINT_MAJOR=10 bun run test:node` tests the built plugin with ESLint 10; the same variable selects the package smoke test's ESLint major.

Repository linting uses `@himynameisdave/oxlint-config/base`; formatting uses `@himynameisdave/oxfmt-config/base`. Run `bun run lint:fix` and `bun run format` before committing. ESLint remains a test dependency for plugin compatibility.

Rules live in `src/rules`; shared cases are in `tests/cases.mjs`. Add regression cases for aliases, CommonJS, scopes, unrelated APIs, JS and TS. Run against both linters and document each rule in `docs/rules`. Prefer diagnostic-only behavior whenever the APIs differ. Never recommend a non-cryptographic hash as a cryptographic replacement.

To review real code without modifying it:

```sh
bun run build
bun scripts/dogfood.ts /path/to/a/bun/project
```

This uses the built plugin, reads JS/TS files listed by ripgrep, ignores inline configuration, and reports findings as JSON. Review every diagnostic and any parse errors. Svelte/Vue single-file components aren't parsed by this script.

Pick one roadmap issue at a time. Research official Bun semantics, define reporting and non-reporting examples, implement the smallest useful analysis, add shared tests, document tradeoffs, select a preset, and dogfood before publishing. New rules get minor releases; bug fixes and docs get patches. Keep future APIs compatible with Bun 1.4 unless the version-awareness policy is revisited.

## Release after testing

1. Confirm CI and the tarball pass in real Bun-only consumers. Review `docs/testing.md`.
2. Update the version in `package.json` and `src/index.ts`, release notes. Run `bun install` to refresh the lockfile if needed.
3. Run `bun run check`. Inspect `npm pack --dry-run` and verify the npm name/account with `npm view eslint-plugin-bunisms` and `npm whoami`.
4. Publish the reviewed tarball with `npm publish ./eslint-plugin-bunisms-<version>.tgz --access public` using the maintainer's npm authentication.
5. Tag that exact commit as `v<version>` and create a GitHub release with the tarball and notes.

CI intentionally builds downloadable test artifacts without publishing to npm. Public release follows maintainer testing. No post-0.1.0 rules belong in the initial release.
