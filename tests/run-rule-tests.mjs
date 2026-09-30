import parser from '@typescript-eslint/parser';

import { cases } from './cases.mjs';
const parse = (item) => ({
  code: item.code,
  ...(item.ts ? { filename: 'test.ts' } : {}),
  languageOptions: {
    ...(item.sourceType ? { sourceType: item.sourceType } : {}),
    ...(item.ts ? { parser } : {}),
  },
});

export function runRuleTests(RuleTester, plugin) {
  const tester = new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: 'module' } });
  for (const [name, suite] of Object.entries(cases)) {
    const errorsFor = (item) => {
      if (name === 'prefer-bun-crypto-hasher') {
        return (
          item.errors ?? Array.from({ length: item.count }, () => ({ messageId: 'preferBunCryptoHasher' }))
        );
      }
      if (name === 'prefer-import-meta-path') {
        return [...item.code.matchAll(/(?:require\('[^']+'\)\.)?[\w$.]+\(import\.meta\.url\)/gu)].map(
          (match) => ({
            messageId: 'preferImportMetaPath',
            line: 1,
            column: match.index + 1,
            endLine: 1,
            endColumn: match.index + match[0].length + 1,
          }),
        );
      }
      return (
        item.errors
        ?? Array.from({ length: item.count }, () => ({
          messageId: item.messageId ?? (name === 'no-dotenv' ? 'noDotenv' : 'preferBun'),
        }))
      );
    };
    tester.run(name, plugin.rules[name], {
      valid: suite.valid.map(parse),
      invalid: suite.invalid.map((item) =>
        Object.assign(parse(item), {
          errors: errorsFor(item),
          output: null,
        }),
      ),
    });
  }
}
