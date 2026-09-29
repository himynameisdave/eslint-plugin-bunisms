import packageJson from '../package.json' with { type: 'json' };
import preferBunFile from './rules/prefer-bun-file.js';
import preferBunSpawn from './rules/prefer-bun-spawn.js';
import preferBunWrite from './rules/prefer-bun-write.js';
import preferImportMetaPath from './rules/prefer-import-meta-path.js';

import type { ESLint, Linter } from 'eslint';

const rules = {
  'prefer-bun-file': preferBunFile,
  'prefer-bun-write': preferBunWrite,
  'prefer-bun-spawn': preferBunSpawn,
  'prefer-import-meta-path': preferImportMetaPath,
};
type Preset = 'recommended' | 'strict' | 'all';
const plugin: ESLint.Plugin & { rules: typeof rules; configs: Record<Preset, Linter.Config> } = {
  meta: { name: 'eslint-plugin-bunisms', version: packageJson.version },
  rules,
  configs: {} as Record<Preset, Linter.Config>,
};
for (const preset of ['recommended', 'strict', 'all'] as const) {
  plugin.configs[preset] = {
    name: `bun/${preset}`,
    plugins: { bun: plugin },
    rules: Object.fromEntries(Object.keys(rules).map((name) => [`bun/${name}`, 'warn' as const])),
  };
}
export default plugin;
