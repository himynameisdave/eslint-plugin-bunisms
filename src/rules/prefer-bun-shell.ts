import { resolveBuiltin } from '../utils/imports.js';

import type { Rule } from 'eslint';

// Bun Shell is async-only, so sync callers also get pointed at Bun.spawnSync().
const methods = new Map([
  ['exec', 'Bun Shell'],
  ['execSync', 'Bun Shell or Bun.spawnSync()'],
]);
const modules = new Set(['child_process']);

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer Bun Shell for shell-oriented process execution.',
      url: 'https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-bun-shell.md',
    },
    schema: [],
    messages: { preferBunShell: 'Consider {{replacement}} for shell-oriented process execution.' },
  },
  create(context) {
    return {
      CallExpression(node) {
        const reference = resolveBuiltin(context, node.callee);
        if (!reference || !modules.has(reference.module) || reference.path.length !== 1) {
          return;
        }
        const [method] = reference.path;
        const replacement = method && methods.get(method);
        if (replacement) {
          context.report({ node: node.callee, messageId: 'preferBunShell', data: { replacement } });
        }
      },
    };
  },
} satisfies Rule.RuleModule;
