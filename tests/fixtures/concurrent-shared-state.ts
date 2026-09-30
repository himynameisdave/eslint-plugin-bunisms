import { expect, it, test as check } from 'bun:test';
import * as bunTest from 'bun:test';

const { test: required } = require('bun:test');
let shared = 0;
let arrived = 0;
let release!: () => void;
const barrier = new Promise<void>((resolve) => {
  release = resolve;
});

// Both callbacks read 0 before either can write: the lost update is deterministic.
check.concurrent('first writer', async () => {
  const before = shared;
  if (++arrived === 2) release();
  await barrier;
  shared = before + 1;
});
it.concurrent('second writer', async () => {
  const before = shared;
  if (++arrived === 2) release();
  await barrier;
  shared = before + 1;
});
check.serial('shared binding was not isolated', () => {
  expect(arrived).toBe(2);
  expect(shared).toBe(1);
});

// Namespace, CommonJS, qualifiers and parameterized tests use the same API.
bunTest.test.concurrent.each([1, 2])('local state %s', async (initial) => {
  let local = initial;
  await Promise.resolve();
  local++;
  expect(local).toBe(initial + 1);
});
required.concurrent('CommonJS binding', () => {
  expect(true).toBe(true);
});
if (process.env.CONCURRENT_ONLY === '1') {
  check.concurrent.only('only qualifier', () => {
    expect(true).toBe(true);
  });
  check.only.concurrent('reversed only qualifier', () => {
    expect(true).toBe(true);
  });
}
check.failing.concurrent('failing qualifier', () => {
  throw new Error('expected');
});
check.concurrent(() => {
  expect(true).toBe(true);
});
check.concurrent.skip('skip qualifier', () => {
  throw new Error('must not run');
});
check.concurrent.todo('todo qualifier', () => {
  throw new Error('must not run');
});
