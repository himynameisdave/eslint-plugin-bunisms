import parser from '@typescript-eslint/parser';
import bun from 'eslint-plugin-bunisms';
export default [bun.configs.recommended, { files: ['**/*.ts'], languageOptions: { parser } }];
