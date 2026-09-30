import packageJson from '../package.json' with { type: 'json' };
import noDotenv from './rules/no-dotenv.js';
import noLateModuleMock from './rules/no-late-module-mock.js';
import preferBunCryptoHasher from './rules/prefer-bun-crypto-hasher.js';
import preferBunFile from './rules/prefer-bun-file.js';
import preferBunShell from './rules/prefer-bun-shell.js';
import preferBunSpawn from './rules/prefer-bun-spawn.js';
import preferBunWrite from './rules/prefer-bun-write.js';
import preferFetch from './rules/prefer-fetch.js';
import preferImportMetaDir from './rules/prefer-import-meta-dir.js';
import preferImportMetaMain from './rules/prefer-import-meta-main.js';
import preferImportMetaPath from './rules/prefer-import-meta-path.js';
import preferImportMetaResolve from './rules/prefer-import-meta-resolve.js';

import type { ESLint, Linter } from 'eslint';

const rules = {
  'prefer-import-meta-dir': preferImportMetaDir,
  'prefer-import-meta-main': preferImportMetaMain,
  'prefer-bun-file': preferBunFile,
  'prefer-bun-crypto-hasher': preferBunCryptoHasher,
  'prefer-bun-write': preferBunWrite,
  'prefer-fetch': preferFetch,
  'prefer-bun-spawn': preferBunSpawn,
  'prefer-bun-shell': preferBunShell,
  'prefer-import-meta-path': preferImportMetaPath,
  'no-dotenv': noDotenv,
  'prefer-import-meta-resolve': preferImportMetaResolve,
  'no-late-module-mock': noLateModuleMock,
};
const strictOnly = new Set([
  'prefer-bun-shell',
  'prefer-fetch',
  'prefer-import-meta-resolve',
  'no-late-module-mock',
]);
type Preset = 'recommended' | 'strict' | 'all';
const plugin: ESLint.Plugin & { rules: typeof rules; configs: Record<Preset, Linter.Config> } = {
  meta: { name: 'eslint-plugin-bunisms', version: packageJson.version },
  rules,
  configs: {} as Record<Preset, Linter.Config>,
};
for (const preset of ['recommended', 'strict', 'all'] as const) {
  const presetRules = Object.keys(rules).filter((name) => preset !== 'recommended' || !strictOnly.has(name));
  plugin.configs[preset] = {
    name: `bun/${preset}`,
    plugins: { bun: plugin },
    rules: Object.fromEntries(presetRules.map((name) => [`bun/${name}`, 'warn' as const])),
  };
}
export default plugin;
