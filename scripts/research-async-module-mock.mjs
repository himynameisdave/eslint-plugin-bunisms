import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Keep every case in its own test process: module mocks persist for the process lifetime.
// A hard timeout records the loader hang without wedging this research script.
const directory = mkdtempSync(join(tmpdir(), 'bunisms-async-module-mock-'));
const subject = "export const value = 'original';\n";
const cases = [
  {
    name: 'lazy factory',
    source: `import { test, expect, mock } from 'bun:test';
test('lazy factory', async () => {
  const result = mock.module('./subject', async () => {
    await Promise.resolve();
    return { value: 'mocked' };
  });
  expect(result).toBeUndefined();
  expect((await import('./subject')).value).toBe('mocked');
});`,
    outcome: 'pass',
  },
  {
    name: 'already loaded, no suspension',
    source: `import { test, expect, mock } from 'bun:test';
import { value } from './subject';
test('no suspension', () => {
  const result = mock.module('./subject', async () => ({ value: 'mocked' }));
  expect(result).toBeUndefined();
  expect(value).toBe('mocked');
});`,
    outcome: 'pass',
  },
  {
    name: 'already loaded, suspending factory',
    source: `import { test, mock } from 'bun:test';
import { value } from './subject';
test('suspending factory', () => {
  mock.module('./subject', async () => {
    await Promise.resolve();
    return { value: 'mocked' };
  });
  console.log(value);
});`,
    outcome: 'timeout',
  },
  {
    name: 'already loaded, awaited suspending factory',
    source: `import { test, mock } from 'bun:test';
import { value } from './subject';
test('awaited suspending factory', async () => {
  await mock.module('./subject', async () => {
    await Promise.resolve();
    return { value: 'mocked' };
  });
  console.log(value);
});`,
    outcome: 'timeout',
  },
  {
    name: 'dynamically loaded, suspending factory',
    source: `import { test, mock } from 'bun:test';
test('dynamically loaded', async () => {
  await import('./subject');
  mock.module('./subject', async () => {
    await Promise.resolve();
    return { value: 'mocked' };
  });
});`,
    outcome: 'timeout',
  },
];

try {
  for (const [index, item] of cases.entries()) {
    const caseDirectory = join(directory, String(index));
    mkdirSync(caseDirectory);
    writeFileSync(join(caseDirectory, 'subject.ts'), subject);
    const testFile = join(caseDirectory, 'case.test.ts');
    writeFileSync(testFile, item.source);
    const result = spawnSync('bun', ['test', testFile], {
      encoding: 'utf8',
      timeout: 2000,
      killSignal: 'SIGKILL',
    });
    let outcome = 'fail';
    if (result.error?.code === 'ETIMEDOUT') {
      outcome = 'timeout';
    } else if (result.status === 0) {
      outcome = 'pass';
    }
    assert.equal(outcome, item.outcome, `${item.name}: ${result.stderr}`);
    process.stdout.write(`${item.name}: ${outcome}\n`);
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}
