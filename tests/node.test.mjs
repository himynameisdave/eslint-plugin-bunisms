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
  });
}
