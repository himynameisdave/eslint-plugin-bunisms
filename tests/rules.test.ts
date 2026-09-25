import { describe, test } from "bun:test";
import { RuleTester } from "eslint";
import { RuleTester as RuleTester10 } from "eslint10";
import plugin from "../src/index.js";
// @ts-expect-error Shared plain-JavaScript harness also runs on Node 18 without a loader.
import { runRuleTests } from "./run-rule-tests.mjs";
for (const [version, tester] of [[9, RuleTester], [10, RuleTester10]] as const) {
  tester.describe = describe;
  tester.it = test;
  tester.itOnly = () => { throw new Error("Focused rule tests are not allowed."); };
  describe(`ESLint ${version}`, () => runRuleTests(tester, plugin));
}
