import parser from "@typescript-eslint/parser";
import { cases } from "./cases.mjs";
export function runRuleTests(RuleTester, plugin) {
  const tester = new RuleTester({ languageOptions: { ecmaVersion: 2022, sourceType: "module" } });
  for (const [name, suite] of Object.entries(cases)) {
    const parse = (item) => ({ code: item.code, ...(item.ts ? { filename: "test.ts", languageOptions: { parser } } : {}) });
    tester.run(name, plugin.rules[name], {
      valid: suite.valid.map(parse),
      invalid: suite.invalid.map((item) => ({ ...parse(item), errors: Array.from({ length: item.count }, () => ({ messageId: "preferBun" })), output: null })),
    });
  }
}
