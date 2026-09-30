import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// @ts-expect-error Shared fixtures intentionally use plain JavaScript for the Node harness.
import { cases } from '../tests/cases.mjs';
const directory = await mkdtemp(join(tmpdir(), 'bunisms-oxlint-'));
try {
  const expected = new Map<string, number>();
  const fixtureRules = new Map<string, string>();
  type Diagnostic = { message: string; line: number; column: number; endColumn: number };
  const exactDiagnostics = new Map<string, Diagnostic[]>();
  type Fixture = {
    code: string;
    ts?: boolean;
    filename?: string;
    sourceType?: string;
    count?: number;
    errors?: Diagnostic[];
  };
  const config = join(directory, '.oxlintrc.json');
  const rules = Object.fromEntries(Object.keys(cases).map((name) => [`bun/${name}`, 'error']));
  await writeFile(
    config,
    JSON.stringify({
      categories: { correctness: 'off' },
      jsPlugins: [{ name: 'bun', specifier: resolve('dist/index.js') }],
      rules,
    }),
  );
  let index = 0;
  const writes: Promise<void>[] = [];
  for (const [name, suite] of Object.entries(cases) as [
    string,
    {
      valid: Fixture[];
      invalid: Fixture[];
    },
  ][]) {
    for (const item of [...suite.valid, ...suite.invalid]) {
      // Plain .js/.ts, like real projects; Oxlint only knows CommonJS from the extension.
      const extension =
        item.filename?.split('.').at(-1)
        ?? `${item.sourceType === 'commonjs' ? 'c' : ''}${item.ts ? 'ts' : 'js'}`;
      const file = join(directory, `case-${index++}.${extension}`);
      fixtureRules.set(file, `bun(${name})`);
      expected.set(file, 'count' in item ? Number(item.count) : 0);
      if (name === 'no-concurrent-test-shared-state' && 'errors' in item && item.errors) {
        exactDiagnostics.set(file, item.errors);
      }
      writes.push(writeFile(file, item.code));
    }
  }
  await Promise.all(writes);
  const result = Bun.spawnSync([
    'node',
    'node_modules/oxlint/bin/oxlint',
    '--config',
    config,
    '--format',
    'json',
    directory,
  ]);
  const output = result.stdout.toString();
  assert.equal(result.exitCode, 1, result.stderr.toString() + output);
  const { diagnostics } = JSON.parse(output);
  const actual = new Map<string, number>();
  const known = new Set(Object.keys(cases).map((name) => `bun(${name})`));
  for (const diagnostic of diagnostics) {
    assert.ok(known.has(diagnostic.code), JSON.stringify(diagnostic));
    const file = resolve(diagnostic.filename);
    if (diagnostic.code !== fixtureRules.get(file)) {
      continue;
    }
    actual.set(file, (actual.get(file) ?? 0) + 1);
  }
  for (const [file, count] of expected) {
    assert.equal(actual.get(file) ?? 0, count, file);
  }
  for (const [file, errors] of exactDiagnostics) {
    const matching = diagnostics.filter(
      (diagnostic: { filename: string; code: string }) =>
        resolve(diagnostic.filename) === file && diagnostic.code === fixtureRules.get(file),
    );
    const locations = matching.map(
      (diagnostic: {
        message: string;
        labels: { span: { line: number; column: number; length: number } }[];
      }) => {
        const [label] = diagnostic.labels;
        assert.ok(label);
        const { line, column, length } = label.span;
        return { message: diagnostic.message, line, column, endColumn: column + length };
      },
    );
    assert.deepEqual(
      locations.toSorted((a: Diagnostic, b: Diagnostic) => a.line - b.line || a.column - b.column),
      errors.map(({ message, line, column, endColumn }) => ({ message, line, column, endColumn })),
      file,
    );
  }
  assert.equal(
    [...actual.values()].reduce((a, b) => a + b, 0),
    [...expected.values()].reduce((a, b) => a + b, 0),
  );
  console.log(`Oxlint passed ${expected.size} shared JavaScript/TypeScript cases.`);
} finally {
  await rm(directory, { recursive: true, force: true });
}
