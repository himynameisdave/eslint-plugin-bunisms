import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

import plugin from '../dist/index.js';
import { runRuleTests } from './run-rule-tests.mjs';
const require = createRequire(import.meta.url);
const major = process.env.ESLINT_MAJOR || '9';
const packageName = major === '10' ? 'eslint10' : 'eslint';
const { RuleTester, ESLint } = await import(packageName);
assert.equal(
  (major === '10' ? require('eslint10/package.json') : require('eslint/package.json')).version.split('.')[0],
  major,
);
assert.equal(plugin.meta.version, require('../package.json').version);
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;
runRuleTests(RuleTester, plugin);
for (const preset of ['recommended', 'strict', 'all']) {
  it(`loads built ${preset} preset`, async () => {
    const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: [plugin.configs[preset]] });
    const [result] = await eslint.lintText("import {readFile} from 'node:fs/promises'; readFile('a');");
    assert.equal(result.messages.length, 1);
    assert.equal(result.messages[0].ruleId, 'bun/prefer-bun-file');
    assert.equal(result.messages[0].severity, 1);
    const [metaPathResult] = await eslint.lintText(
      "import { fileURLToPath } from 'node:url'; fileURLToPath(import.meta.url);",
    );
    assert.equal(metaPathResult.messages.length, 1);
    assert.equal(metaPathResult.messages[0].ruleId, 'bun/prefer-import-meta-path');
    assert.equal(metaPathResult.messages[0].severity, 1);
    const [dotenvResult] = await eslint.lintText("import 'dotenv/config';");
    assert.equal(dotenvResult.messages.length, 1);
    assert.equal(dotenvResult.messages[0].ruleId, 'bun/no-dotenv');
    assert.equal(dotenvResult.messages[0].severity, 1);
    const [mockResult] = await eslint.lintText("import { spyOn } from 'bun:test'; spyOn(object, 'method');");
    const mockMessage = mockResult.messages.find(
      (message) => message.ruleId === 'bun/prefer-mock-restore-in-after-each',
    );
    assert.equal(Boolean(mockMessage), preset !== 'recommended');
  });
}
for (const { rule, code, message, column, endColumn } of [
  {
    rule: 'prefer-bun-shell',
    code: "import { exec } from 'node:child_process'; exec('echo hello');",
    message: 'Consider Bun Shell for shell-oriented process execution.',
    column: 44,
    endColumn: 48,
  },
  {
    rule: 'prefer-fetch',
    code: "import https from 'node:https'; https.get(url);",
    message: 'Prefer fetch() over Node.js get() when targeting Bun.',
    column: 33,
    endColumn: 42,
  },
]) {
  it(`ships ${rule} in strict and all but not recommended`, async () => {
    await Promise.all(
      ['recommended', 'strict', 'all'].map(async (preset) => {
        const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: [plugin.configs[preset]] });
        const [result] = await eslint.lintText(code);
        const found = result.messages.find((entry) => entry.ruleId === `bun/${rule}`);
        assert.equal(Boolean(found), preset !== 'recommended');
        if (found) {
          assert.equal(found.message, message);
          assert.equal(found.line, 1);
          assert.equal(found.column, column);
          assert.equal(found.endColumn, endColumn);
        }
      }),
    );
  });
}

it('ships diagnostic-only prefer-import-meta-resolve in strict and all', async () => {
  await Promise.all(
    ['recommended', 'strict', 'all'].map(async (preset) => {
      const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: [plugin.configs[preset]] });
      const [result] = await eslint.lintText("require.resolve('some-package');");
      assert.equal(result.messages.length, preset === 'recommended' ? 0 : 1);
      if (preset !== 'recommended') {
        const [message] = result.messages;
        assert.equal(message.ruleId, 'bun/prefer-import-meta-resolve');
        assert.equal(message.message, 'Consider import.meta.resolve for module resolution in Bun ESM.');
        assert.equal(message.column, 1);
        assert.equal(message.endColumn, 16);
        assert.equal(message.severity, 1);
        assert.equal(message.fix, undefined);
        assert.equal(message.suggestions, undefined);
      }
    }),
  );
});

it('ships no-late-module-mock in strict and all but not recommended', async () => {
  await Promise.all(
    ['recommended', 'strict', 'all'].map(async (preset) => {
      const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: [plugin.configs[preset]] });
      const [result] = await eslint.lintText(
        "import './foo'; import { mock } from 'bun:test'; mock.module('./foo', () => ({}));",
      );
      const messages = result.messages.filter((message) => message.ruleId === 'bun/no-late-module-mock');
      assert.equal(messages.length, preset === 'recommended' ? 0 : 1);
    }),
  );
});
