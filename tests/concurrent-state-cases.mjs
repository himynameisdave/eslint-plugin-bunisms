const prefix = "import { test, it, describe } from 'bun:test'; let counter = 0; ";
const valid = [
  "test.concurrent('local', () => { let counter = 0; counter++; });",
  "test.concurrent('hoisted local', () => { counter++; var counter = 0; });",
  "test.concurrent('parameter', (counter) => { counter++; });",
  "test.concurrent('block', () => { { let counter = 0; counter++; } });",
  "test.concurrent('catch', () => { try {} catch (counter) { counter = 1; } });",
  "test.concurrent('read', () => { const local = counter + 1; });",
  "test.concurrent('unknown', () => { missing++; });",
  "test.concurrent('global', () => { globalThis.counter++; });",
  "test.concurrent('properties', () => { counter.value++; counter.value = 1; delete counter.value; });",
  "test.concurrent('methods', () => { counter.push(1); Atomics.add(counter, 0, 1); });",
  "test.concurrent('nested', () => { const update = () => { counter++; }; });",
  "test.concurrent('helper', () => { update(); }); function update() { counter++; }",
  "test.concurrent('locked', async () => { await lock.runExclusive(() => { counter++; }); });",
  "test.concurrent('class', () => { class Deferred { field = counter++; method() { counter++; } } });",
  "test.concurrent('class expression', () => { const Deferred = class { field = counter++; }; });",
  "test('ordinary', () => { counter++; });",
  "test.serial('serial', () => { counter++; });",
  "test.concurrent.serial('serial', () => { counter++; });",
  "test.serial.concurrent('ambiguous', () => { counter++; });",
  "test.concurrent.skip('skipped', () => { counter++; });",
  "test.concurrent.todo('todo', () => { counter++; });",
  "test.concurrent.custom('unknown', () => { counter++; });",
  "test.concurrent.if(enabled)('conditional', () => { counter++; });",
  "test.concurrent.each([1]).custom('unknown', () => { counter++; });",
  "describe.concurrent('inherited', () => { test('ordinary', () => { counter++; }); });",
  "describe('suite local', () => { let shared = 0; test.concurrent('one', () => { shared++; }); });",
  "function register() { let shared = 0; test.concurrent('one', () => { shared++; }); }",
  "const callback = () => { counter++; }; test.concurrent('indirect', callback);",
  "const concurrent = test.concurrent; concurrent('alias', () => { counter++; });",
  "function run(test) { test.concurrent('shadowed', () => { counter++; }); }",
  "test.concurrent('nested function', () => { function helper() { counter++; } });",
  "test.concurrent('one', () => {}); counter++;",
].map((code) => ({ code: prefix + code }));
valid.push(
  ...[
    "let counter = 0; test.concurrent('unbound', () => { counter++; });",
    "let counter = 0; function test() {} test.concurrent('local', () => { counter++; });",
    "import { test } from 'vitest'; let counter = 0; test.concurrent('other', () => { counter++; });",
    "import { test } from 'node:test'; let counter = 0; test.concurrent('other', () => { counter++; });",
    "import { test } from 'test'; let counter = 0; test.concurrent('other', () => { counter++; });",
    "import bunTest from 'bun:test'; let counter = 0; bunTest.test.concurrent('default', () => { counter++; });",
    "import { default as bunTest } from 'bun:test'; let counter = 0; bunTest.test.concurrent('default', () => { counter++; });",
    "import * as bunTest from 'bun:test'; let counter = 0; bunTest.default.test.concurrent('default', () => { counter++; });",
    "import { test } from 'bun:test'; test.concurrent = custom; let counter = 0; test.concurrent('mutated', () => { counter++; });",
    "let { test } = require('bun:test'); test = custom; let counter = 0; test.concurrent('reassigned', () => { counter++; });",
    "function run(require) { const { test } = require('bun:test'); test.concurrent('shadowed', () => { counter++; }); } let counter = 0;",
    "import * as bunTest from 'bun:test'; let counter = 0; function run(bunTest) { bunTest.test.concurrent('shadowed', () => { counter++; }); }",
    "import { test } from 'bun:test'; import { counter } from './state'; test.concurrent('imported', () => { counter++; });",
    "const { test } = require('bun:test'); { let counter = 0; test.concurrent('block scope', () => { counter++; }); }",
  ].map((code) => ({ code })),
);

// Mark the exact identifier to report; comments remain in the fixture source.
const invalid = (code, options = {}) => ({
  code,
  ...options,
  count: [...code.matchAll(/\/\*write\*\/(?<identifier>\w+)/gu)].length,
  errors: [...code.matchAll(/\/\*write\*\/(?<identifier>\w+)/gu)].map((match) => {
    const offset = match.index + '/*write*/'.length;
    const preceding = code.slice(0, offset).split('\n');
    const line = preceding.length;
    const column = preceding.at(-1).length + 1;
    return {
      message: 'Concurrent tests mutate shared state; isolate state within each test.',
      line,
      column,
      endLine: line,
      endColumn: column + match.groups.identifier.length,
      suggestions: [],
    };
  }),
});
const invalidCases = [
  ...[
    "test.concurrent('increment', () => { /*write*/counter++; });",
    "it.concurrent('decrement', function () { --/*write*/counter; });",
    "test['concurrent']('assign', async () => { await work(); /*write*/counter = 1; });",
    "test.concurrent('compound', () => { /*write*/counter += 2; });",
    "test.concurrent('logical', () => { /*write*/counter ||= 2; });",
    "test.concurrent('destructure', () => { ({ value: /*write*/counter } = value); });",
    "test.concurrent('array', () => { [/*write*/counter] = value; });",
    "test.concurrent('rest', () => { [.../*write*/counter] = value; });",
    "test.concurrent('default', () => { ({ value: /*write*/counter = 1 } = value); });",
    "test.concurrent('for of', () => { for (/*write*/counter of values) {} });",
    "test.concurrent('for in', () => { for (/*write*/counter in values) {} });",
    "test.concurrent('block', () => { if (enabled) { /*write*/counter++; } });",
    "test.concurrent('multiple', () => { /*write*/counter++; /*write*/counter = 2; });",
    "test.concurrent('first', () => { /*write*/counter++; }); test.concurrent('second', () => { /*write*/counter++; });",
    "test.concurrent('scope restored', () => { const nested = () => {}; /*write*/counter++; });",
    "test.concurrent('shadow restored', () => { { let counter = 0; counter++; } /*write*/counter++; });",
    "test.concurrent('class restored', () => { class Local {} /*write*/counter++; });",
    "describe('suite', () => { test.concurrent('one', () => { /*write*/counter++; }); });",
    "test.concurrent.only('only', () => { /*write*/counter++; });",
    "test.only.concurrent('only', () => { /*write*/counter++; });",
    "test.failing.concurrent('failing', () => { /*write*/counter++; });",
    "test.concurrent.each([1, 2])('each %s', (value) => { /*write*/counter = value; });",
    "test.concurrent.each([1, 2])('shadowed each %s', (counter) => { counter++; }); test.concurrent('next', () => { /*write*/counter++; });",
    'test.concurrent(() => /*write*/counter++);',
    "test.concurrent('multiline', () => {\n  /*write*/counter++;\n});",
  ].map((code) => invalid(prefix + code)),
  ...[
    "import { test as check } from 'bun:test'; let counter = 0; check.concurrent('alias', () => { /*write*/counter++; });",
    "import * as bunTest from 'bun:test'; let counter = 0; bunTest.it.concurrent('namespace', () => { /*write*/counter++; });",
    "const { test: check } = require('bun:test'); let counter = 0; check.concurrent('require', () => { /*write*/counter++; });",
    "const bunTest = require('bun:test'); let counter = 0; bunTest.test.concurrent('require', () => { /*write*/counter++; });",
    "let counter = 0; require('bun:test').test.concurrent('direct', () => { /*write*/counter++; });",
    "import { test } from 'bun:test'; var counter = 0; test.concurrent('var', () => { /*write*/counter++; });",
    "import { test } from 'bun:test'; export let counter = 0; test.concurrent('export', () => { /*write*/counter++; });",
    "import { test } from 'bun:test'; test.concurrent('later', () => { /*write*/counter++; }); let counter = 0;",
  ].map((code) => invalid(code)),
  invalid(
    "const { test } = require('bun:test'); let counter = 0; test.concurrent('commonjs', () => { /*write*/counter++; });",
    { sourceType: 'commonjs' },
  ),
];

export const concurrentStateCases = {
  valid: [
    ...valid,
    // oxlint-disable-next-line no-map-spread -- Preserve separate JavaScript and TypeScript fixtures.
    ...valid.map((item) => ({ ...item, ts: true })),
    {
      code: "import type { test } from 'bun:test'; let counter = 0; test.concurrent('type', () => { counter++; });",
      ts: true,
    },
    {
      code: "import { type test } from 'bun:test'; let counter = 0; test.concurrent('type', () => { counter++; });",
      ts: true,
    },
    {
      code: "import { test } from 'bun:test'; let counter: number = 0; test.concurrent('local', () => { let counter: number = 0; counter++; });",
      ts: true,
    },
  ],
  invalid: [
    ...invalidCases,
    // oxlint-disable-next-line no-map-spread -- Preserve separate JavaScript and TypeScript fixtures.
    ...invalidCases.map((item) => ({ ...item, ts: true })),
    invalid(
      "import { test } from 'bun:test'; let counter: number = 0; test.concurrent('typed', (): void => { /*write*/counter++; });",
      { ts: true },
    ),
  ],
};
