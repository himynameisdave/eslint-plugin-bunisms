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

## prefer-import-meta-main validation

Issue #3 implementation, September 28, 2026; planned for its own 0.4.0 minor
release after the preceding releases. The package version is unchanged by this PR;
it does not publish or combine the planned releases.

- Official semantics and migration caveats are recorded in the
  [rule documentation](rules/prefer-import-meta-main.md).
- `bun run test:entrypoint` passes on Bun 1.4.0 and 1.4.2 for direct/imported
  JS, TS, ESM and CommonJS modules, including both directions and polarities.
- 112 new shared fixtures cover JS/TS, equality/inequality, computed properties,
  both directions, multiple reports, lexical shadowing, unrelated imports,
  aliases, optional chains and non-comparison expressions. RuleTester asserts
  comparison locations and absence of fixes/suggestions; the suite includes
  explicit CommonJS parsing. Oxlint runs the same source fixtures.
- Read-only dogfood of the built recommended preset covered 687 files:
  [Elysia](https://github.com/elysiajs/elysia/tree/e037eca710e7ad193be09cc6615ab0dbe54af914)
  (238 files) and
  [Hono](https://github.com/honojs/hono/tree/18331a905e2415f7f73038357f2eec354123f7a6)
  (449 files). No parse failures or entrypoint-rule findings. Hono had five
  findings from existing rules. No false positives from the new rule appeared,
  but this sample contains no positive entrypoint finding; fixtures and runtime
  tests supply positive coverage.
- Final linter checks passed with ESLint 9.39.5 and 10.11.0 under Node 22.22.2
  (365 rule cases plus three preset checks per major), and Oxlint 1.85.0
  (365 shared fixtures). Clean npm tarball integration passed with both ESLint
  majors and Oxlint on JS/TS, including ten expected fixture diagnostics.
  Type checking, linting and formatting checks also passed.

## prefer-bun-crypto-hasher validation

September 29, 2026: the rule recognizes direct `crypto.createHash()` calls with
a literal algorithm, one or more chained `.update()` calls, and either no
digest encoding or `hex`, `base64` or `base64url` (both runtimes return a
`Buffer` without one). It excludes HMAC, XOF algorithms, dynamic or unsupported
algorithms, mutable/shadowed bindings, stored hash instances and other digest
encodings. It provides no fix or suggestion. See the rule documentation for the
full report boundary.

- Official [Bun hashing docs](https://bun.sh/docs/runtime/hashing#buncryptohasher)
  document the supported algorithms, incremental updates and encodings; they
  identify `Bun.hash` as non-cryptographic. Bun's
  [Node `Hash.update()` reference](https://bun.sh/reference/node/crypto/Hash/update)
  documents compatible streaming input. `Bun.CryptoHasher` on Bun 1.4.2
  matched digests recorded from real Node 22.22.2 for SHA-256 and SHA3-256,
  with multiple updates and each of the three supported digest encodings.
  (`bun test` swaps `node:crypto` for Bun's own, so the test uses recorded
  Node output.) Real Node rejects `blake2b256` and `md4`, and Bun hashes
  `'utf-16le'` update input differently, so the rule skips them.
- 573 shared JS/TS fixtures pass under ESLint 9.39.5 and 10.11.0 on Node 22,
  and through Oxlint 1.85.0. They cover import forms, CommonJS, shadowing,
  HMAC exclusion, incompatible options/encodings, multiple reports and exact
  diagnostic location. Clean packed-package checks pass with ESLint 9, ESLint
  10 and Oxlint.
- Read-only dogfood covered 687 files in
  [Elysia at `e037eca`](https://github.com/elysiajs/elysia/tree/e037eca710e7ad193be09cc6615ab0dbe54af914)
  and [Hono at `37ce069`](https://github.com/honojs/hono/tree/37ce06904e732d4bc11c9075adf362c76049a594), with no
  parse errors. Elysia had no findings. Hono had five findings, all in test
  files; each was reviewed. They compare hash implementations or pass a hash
  callback to test timing-safe equality. They are valid migration candidates
  when those tests run under Bun, while Node and Fastly test targets should
  retain Node's API. Scope this warning preset to Bun-targeted files in
  multi-runtime repositories.

Runtime comparisons ran on Bun 1.4.2; minimum-version runtime execution on Bun
1.4.0 is not recorded here. This implementation does not publish or bump the
package version; the rule remains planned for its own 0.6.0 release after the
release sequence and dogfooding described in `VERSIONING.md`.

## prefer-import-meta-resolve validation

Issue [#9](https://github.com/himynameisdave/eslint-plugin-bunisms/issues/9), September 29, 2026. This adds one rule, intended for its own minor release (the issue schedules 0.10.0). The package version remains unchanged; publishing and release sequencing remain separate, with dogfooding required before the next rule.

Official [Bun module resolution documentation](https://bun.com/docs/runtime/module-resolution) describes URL results and conditional exports. The [Node lookup-options contract](https://nodejs.org/api/modules.html#requireresolverequest-options) explains why `paths` cannot be mechanically translated. `bun run test:resolve` verified on Bun 1.4.0 and 1.4.2 (macOS arm64) that file results change from paths to URLs, built-in `fs` becomes `node:fs`, and a package with distinct `require`/`import` exports resolves to different files. Custom lookup roots work with `require.resolve`; JS, TS, MJS and CJS runtime entrypoints were exercised. Reserved filename characters expose a runtime boundary: spaces and Unicode are encoded, but `#` and `%` remain unescaped. The regression probe records this behavior; the rule excludes specifiers containing `#`, `?` or `%`.

The diagnostic-only boundary is deliberately conservative: direct unshadowed global calls with one nonempty string literal in module-parsed files. CommonJS parsing/extensions/markers, local resolvers, aliases, optional calls, dynamic arguments, lookup options and direct mutations are excluded. Package export maps and result consumers are not analyzed, so reports request manual review rather than claiming equivalence. `strict` and `all` enable it; `recommended` does not.

The shared suite adds 127 fixtures (107 valid and 20 invalid), including JS/TS, exact diagnostic messages and locations, multiple reports, binding and CommonJS exclusions, and absence of fixes/suggestions. ESLint 9 and 10 execute the built plugin under Node; Oxlint 1.85.0 runs all 700 shared fixtures. Oxlint infers script format for ambiguous `.js`/`.ts` fixtures, so the harness now uses `.mjs`/`.mts` for RuleTester's default module mode and `.cjs` for script/CommonJS cases. This is a parser-mode distinction, not a suppressed rule failure. Clean tarball consumers cover recommended exclusion and strict inclusion on ESLint JS/TS and explicit inclusion on Oxlint JS/TS.

Read-only review with the built rule covered 772 JS/TS/JSX/TSX source files, excluding declarations, in [Elysia at e037eca](https://github.com/elysiajs/elysia/tree/e037eca710e7ad193be09cc6615ab0dbe54af914) (238), [Hono at 18331a9](https://github.com/honojs/hono/tree/18331a905e2415f7f73038357f2eec354123f7a6) (449), and [Bun packages at 9f70da0](https://github.com/oven-sh/bun/tree/9f70da074192e55c3ec68aef7fd982e6b4b0284b/packages) (85). Inline linter directives were disabled for this isolated review. No parse failures or diagnostics occurred. Bun's npm installer contains a dynamic `require.resolve(join(...))` call and is correctly excluded. This sample found no false positives but provides no real-project positive match; fixture and runtime tests provide positive coverage.
