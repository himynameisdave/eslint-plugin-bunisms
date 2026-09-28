# Versioning

This plugin uses `major.minor.patch` versions. A release number describes the effect of upgrading the plugin, including changes to its ESLint presets and lint results. Release tags and GitHub releases use bare numbers such as `1.0.0` (no `v` prefix).

## Before 1.0

The `0.x` series is for building the initial rule set in the [roadmap](docs/roadmap.md). After `0.1.0`, add one rule per minor release: `0.2.0`, `0.3.0`, and so on. Minor releases may also contain other changes to rules or presets while the API is still settling. Use patch releases for targeted fixes that do not intentionally change the rule set or preset membership.

Release `1.0.0` when the planned stable rule set and its presets are ready. The experimental concurrent shared-state rule may remain outside the presets and the 1.0 release, as described in the roadmap. The documentation site and third-party migrations do not block 1.0.

## From 1.0 onward

| Bump | Changes |
| ---- | ------- |
| Major (`1.0.0` → `2.0.0`) | Add a rule; add an existing rule to a preset; increase a preset's severity; remove or rename a rule or public export; change an existing rule's defaults or options incompatibly; raise supported runtime or linter minimums. |
| Minor (`1.0.0` → `1.1.0`) | Add an opt-in option whose default preserves existing behavior, or make another backward-compatible API addition that does not add a rule or change preset results. |
| Patch (`1.0.0` → `1.0.1`) | Fix bugs, false positives, crashes, or documentation without intentionally changing the public API or preset membership. A fix for a false negative may produce new diagnostics; call that out in the release notes. |

Every new rule gets a major release, even if it is initially opt-in. This is a deliberate, simple release policy: currently `recommended`, `strict`, and `all` enable every registered rule, so adding one changes lint results for existing preset users. Warnings can also fail CI when users set a maximum warning count. If preset membership becomes selective later, the rule-addition policy still holds unless this guide is explicitly revised.

When a release contains several kinds of changes, use the highest applicable bump. For each new rule, document the behavior and preset membership, then summarize any new diagnostics or migration work in the release notes. A major version can contain several new rules when they are released together; the pre-1.0 one-rule-per-minor cadence does not require one major release per rule after 1.0.

See [Publishing](PUBLISHING.md) for the release workflow.
