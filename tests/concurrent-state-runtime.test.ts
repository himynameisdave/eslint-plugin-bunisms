import { expect, test } from 'bun:test';

test('concurrent tests share file state while callback-local state stays isolated', () => {
  const result = Bun.spawnSync([
    process.execPath,
    'test',
    '--max-concurrency',
    '2',
    `${import.meta.dir}/fixtures/concurrent-shared-state.ts`,
  ]);
  expect(result.stderr.toString()).toContain(' 8 pass');
  expect(result.exitCode).toBe(0);
});

test('only and concurrent qualifiers can be chained in either order', () => {
  const result = Bun.spawnSync([process.execPath, 'test', `${import.meta.dir}/fixtures/concurrent-shared-state.ts`], {
    env: { ...process.env, CONCURRENT_ONLY: '1' },
  });
  expect(result.stderr.toString()).toContain(' 2 pass');
  expect(result.exitCode).toBe(0);
});
