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

## prefer-import-meta-dir validation

September 28, 2026: the new rule adds 68 shared JS/TS cases covering positive matches, exact messages and locations, aliases, default/namespace imports, CommonJS bindings in modules, shadowing, mutations, type-only imports and semantic exclusions. ESLint 9 and 10 run the fixtures under Node 22; Oxlint runs the same fixtures through the built plugin. Clean tarball consumers exercise the new rule in JS and TS with both ESLint majors and Oxlint.

Runtime tests passed on Bun 1.4.0 and 1.4.2 on macOS arm64, including spaces, reserved URL characters, Unicode and symlink entry points. The new test is included in `bun run test`. No fix or suggestion is provided; cross-runtime, loader and bundler migrations remain manual.

Read-only review of [Elysia at e037eca](https://github.com/elysiajs/elysia/tree/e037eca710e7ad193be09cc6615ab0dbe54af914) (238 files) and [Bun packages at 9f70da0](https://github.com/oven-sh/bun/tree/9f70da074192e55c3ec68aef7fd982e6b4b0284b/packages) (86 files) found no diagnostics from this rule and no parse errors. This sample establishes no observed false positives; it does not provide a real-project positive match.

Issue #2 targets 0.3.0 and requires one new rule per minor release. This implementation does not publish or bump the package: release sequencing and dogfooding before the next rule remain release gates.
