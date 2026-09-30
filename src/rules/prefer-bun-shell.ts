import { resolveBuiltin } from '../utils/imports.js';

import type { Rule } from 'eslint';

const methods = new Set(['exec', 'execSync']);
const modules = new Set(['child_process']);

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer Bun Shell for shell-oriented process execution.',
      url: 'https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-bun-shell.md',
    },
    schema: [],
    messages: { preferBunShell: 'Consider Bun Shell for shell-oriented process execution.' },
  },
  create(context) {
    return {
      CallExpression(node) {
        const reference = resolveBuiltin(context, node.callee);
        if (!reference || !modules.has(reference.module) || reference.path.length !== 1) {
          return;
        }
        const [method] = reference.path;
        if (method && methods.has(method)) {
          context.report({ node: node.callee, messageId: 'preferBunShell' });
        }
      },
    };
  },
} satisfies Rule.RuleModule;
