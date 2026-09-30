import { expect, test } from 'bun:test';

// Module mocks cannot be undone, so run the late mock in its own process.
test('a late mock updates live bindings but cannot undo original side effects', () => {
  const result = Bun.spawnSync([process.execPath, 'test', `${import.meta.dir}/fixtures/late-module-mock.ts`]);
  expect(result.stderr.toString()).toContain(' 1 pass');
  expect(result.exitCode).toBe(0);
});
