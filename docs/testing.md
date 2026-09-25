# 0.1.0 testing record

Prepared September 25, 2026. This is a testing candidate, not a published npm release.

## Automated validation

- Bun 1.4.2 development/build runtime; plain ESM output with declarations and no production dependencies.
- ESLint 9.39.5 and 10.11.0: 253 shared RuleTester cases per major, including JavaScript, TypeScript, imports, aliases, CommonJS, shadowing, visible mutation and negative cases.
- Node executes the built plugin with each major; all three flat presets register `bun` correctly.
- Oxlint 1.85.0 runs the same 253 cases through its CLI, with expected diagnostic counts per file.
- A clean npm tarball install succeeds without installing the optional ESLint peer. Node imports the package without Bun. Separate real ESLint and Oxlint fixture projects resolve it by package name and each report exactly eight expected diagnostics across JS and TS.
- GitHub CI covers Node 18.18 / ESLint 9; Node 20.19 / ESLint 10; Node 22 / both majors; Node 24 / ESLint 10. A separate Oxlint job identifies compatibility regressions.

## Real-project review

Ran the built plugin read-only over 542 JavaScript/TypeScript files in three existing Bun-using projects. No project source was changed and no parse errors occurred. Framework single-file components were excluded.

- Independent public project: [elysiajs/elysia](https://github.com/elysiajs/elysia/tree/e037eca710e7ad193be09cc6615ab0dbe54af914), 238 files, zero findings.
- Existing application A: 71 files, one `spawnSync` finding in a Bun-only build script. Useful candidate; stderr decoding and exit status mapping require manual migration.
- Existing application B: 233 files, one promise `readFile` finding in a JSON fixture loader. The binding is correct, but the application uses a Node deployment adapter: keep the Node API when that runtime is intended. This reinforces scoping the preset to Bun-only files.

Both diagnostics were reviewed at their call sites. Private application source is intentionally not included here. These checks are initial evidence, not proof of universal semantic equivalence or complete absence of false positives. In particular, writeFile has fixture coverage but no real-project finding in this sample.

## Before public release

- Install the CI tarball into your intended Bun repositories and review every diagnostic.
- Check callback/options/encoding and subprocess differences before migrating code.
- Confirm CI is green and review the packed file list.
- Publish and tag only after this testing, following CONTRIBUTING.md.
