import base from '@himynameisdave/oxlint-config/base';
import bun from '@himynameisdave/oxlint-config/bun';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [base, bun],
  overrides: [
    {
      files: ['scripts/**/*.ts'],
      rules: {
        // CLI scripts intentionally print results for developers and CI.
        'eslint/no-console': 'off',
      },
    },
  ],
  env: { node: true, bun: true },
  // Fixtures deliberately contain invalid code and are checked by the integration suites.
  ignorePatterns: ['dist/**', 'tests/fixtures/**'],
});
