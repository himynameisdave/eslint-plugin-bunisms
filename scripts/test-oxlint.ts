import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
// @ts-expect-error Shared fixtures intentionally use plain JavaScript for the Node harness.
import { cases } from "../tests/cases.mjs";
const directory = await mkdtemp(join(tmpdir(), "bunisms-oxlint-"));
try {
  const expected = new Map<string, number>();
  const config = join(directory, ".oxlintrc.json");
  await writeFile(config, JSON.stringify({ categories: { correctness: "off" }, jsPlugins: [{ name: "bun", specifier: resolve("dist/index.js") }], rules: Object.fromEntries(Object.keys(cases).map((name) => [`bun/${name}`, "error"])) }));
  let index = 0;
  for (const suite of Object.values(cases) as { valid: { code: string; ts?: boolean }[]; invalid: { code: string; ts?: boolean; count: number }[] }[]) {
    for (const item of [...suite.valid, ...suite.invalid]) {
      const file = join(directory, `case-${index++}.${item.ts ? "ts" : "js"}`);
      expected.set(file, "count" in item ? Number(item.count) : 0);
      await writeFile(file, item.code);
    }
  }
  const result = Bun.spawnSync(["node", "node_modules/oxlint/bin/oxlint", "--config", config, "--format", "json", directory]);
  const output = result.stdout.toString();
  assert.equal(result.exitCode, 1, result.stderr.toString() + output);
  const diagnostics = JSON.parse(output).diagnostics;
  const actual = new Map<string, number>();
  for (const diagnostic of diagnostics) {
    assert.match(diagnostic.code, /bun\(prefer-bun-(?:file|write|spawn)\)/u, JSON.stringify(diagnostic));
    const file = resolve(diagnostic.filename);
    actual.set(file, (actual.get(file) ?? 0) + 1);
  }
  for (const [file, count] of expected) assert.equal(actual.get(file) ?? 0, count, file);
  assert.equal([...actual.values()].reduce((a, b) => a + b, 0), [...expected.values()].reduce((a, b) => a + b, 0));
  console.log(`Oxlint passed ${expected.size} shared JavaScript/TypeScript cases.`);
} finally {
  await rm(directory, { recursive: true, force: true });
}
