# AGENTS.md

ESLint plugin (`eslint-plugin-bunisms`, prefix `bun/`) with rules for idiomatic Bun code. Works with ESLint 9–10 and Oxlint JS plugins. No runtime dependencies.

## Layout

- `src/index.ts`: plugin entry; registers rules and the `recommended`/`strict`/`all` presets.
- `src/rules/<name>.ts`: one file per rule. Shared helpers in `src/utils/` (`create-rule.ts`, `imports.ts`); reuse them.
- `tests/`: rule tests (`cases.mjs`, `rules.test.ts`), plus Node and fixture tests.
- `docs/rules/<name>.md`: one doc per rule.
- `scripts/`: build, Oxlint and package checks.

## Commands

- `bun install --frozen-lockfile`: install (also enables the pre-commit hook).
- `bun run check`: full gate (typecheck, lint, format, tests, build, package checks). Run before opening a PR.
- `bun run lint:fix` / `bun run format`: routine fixes.

## Adding or changing a rule

1. Add the rule in `src/rules/` and register it in `src/index.ts`.
2. Add test cases in `tests/`.
3. Add or update `docs/rules/<name>.md` and the rules table in `README.md`.

## Rule docs format

Rule docs must follow the [eslint-plugin-unicorn](https://github.com/sindresorhus/eslint-plugin-unicorn/tree/main/docs/rules) format. Copy an existing doc such as `docs/rules/prefer-bun-file.md`:

1. `# <rule-name>` (no `bun/` prefix).
2. `📝 <description>`, matching the rule's `meta.docs.description`.
3. Config line: `⚠️ This rule _warns_ in the following [configs](...): ✅ \`recommended\`, 🔒 \`strict\`, 🌐 \`all\`.`
4. Short prose: why the Bun API is better, what is and isn't reported, and when not to use the rule.
5. `## Examples` with `// ❌` / `// ✅` code blocks.
6. `## Options` only if the rule has options.

No other headings. Keep it short.
