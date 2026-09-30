import { expect, mock, test } from 'bun:test';

import { value } from './module-mock-target.js';

test('a late mock updates live bindings but cannot undo original side effects', () => {
  const effects = globalThis as typeof globalThis & { bunismsModuleMockEffects?: number };
  expect(effects.bunismsModuleMockEffects).toBe(1);
  expect(value).toBe('original');

  mock.module('./module-mock-target.js', () => ({ value: 'mocked' }));

  expect(value).toBe('mocked');
  expect(effects.bunismsModuleMockEffects).toBe(1);
});
