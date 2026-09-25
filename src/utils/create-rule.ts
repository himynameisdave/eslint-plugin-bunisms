import { resolveBuiltin } from './imports.js';

import type { Rule } from 'eslint';

export function createRule(
  name: string,
  methods: Record<string, string>,
  modules: string[],
  fsPromises = false,
): Rule.RuleModule {
  return {
    meta: {
      type: 'suggestion',
      docs: {
        description: `Prefer ${Object.values(methods).join(' or ')} over the corresponding Node.js APIs.`,
        url: `https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/${name}.md`,
      },
      schema: [],
      messages: { preferBun: 'Prefer {{replacement}} over Node.js {{method}}() when targeting Bun.' },
    },
    create(context) {
      return {
        CallExpression(node) {
          const reference = resolveBuiltin(context, node.callee);
          if (!reference || !modules.includes(reference.module)) {
            return;
          }
          let { path } = reference;
          if (fsPromises && reference.module === 'fs' && path[0] === 'promises') {
            path = path.slice(1);
          }
          if (path.length !== 1) {
            return;
          }
          const [method] = path;
          if (!method || !Object.hasOwn(methods, method)) {
            return;
          }
          const replacement = methods[method];
          if (!replacement) {
            return;
          }
          context.report({
            node: node.callee,
            messageId: 'preferBun',
            data: { method, replacement },
          });
        },
      };
    },
  };
}
