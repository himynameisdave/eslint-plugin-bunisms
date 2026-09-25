import { ESLint } from "eslint";
import parser from "@typescript-eslint/parser";
import type sourcePlugin from "../src/index.js";
import { resolve, extname } from "node:path";
const { default: plugin }: { default: typeof sourcePlugin } = await import(new URL("../dist/index.js", import.meta.url).href);
const eslint = new ESLint({ overrideConfigFile: true, allowInlineConfig: false, overrideConfig: [plugin.configs.recommended, { linterOptions: { reportUnusedDisableDirectives: false } }, { files: ["**/*.{js,mjs,cjs,ts,tsx,mts,cts,jsx}"], languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } } } }] });
for (const directory of process.argv.slice(2)) {
  const root = resolve(directory);
  const listing = Bun.spawnSync(["rg", "--files", "-g", "*.{js,mjs,cjs,ts,tsx,mts,cts,jsx}", "-g", "!*.d.ts", "-g", "!bun.lock", root]);
  if (listing.exitCode !== 0) throw new Error(listing.stderr.toString());
  let files = 0;
  const diagnostics = [];
  for (const file of listing.stdout.toString().trim().split("\n")) {
    const [result] = await eslint.lintText(await Bun.file(file).text(), { filePath: `dogfood${extname(file)}` });
    files++;
    for (const message of result!.messages) diagnostics.push({ file, ...message });
  }
  console.log(JSON.stringify({ root, files, diagnostics }, null, 2));
}
