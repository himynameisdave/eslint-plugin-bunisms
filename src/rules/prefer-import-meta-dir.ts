import { resolveBuiltin } from '../utils/imports.js';

import type { Rule } from 'eslint';
import type { Node } from 'estree';

function isBuiltin(context: Rule.RuleContext, node: Node, module: string, method: string): boolean {
  const reference = resolveBuiltin(context, node);
  return reference?.module === module && reference.path.length === 1 && reference.path[0] === method;
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer import.meta.dir for the current module directory.',
      url: 'https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-import-meta-dir.md',
    },
    schema: [],
    messages: { preferBun: 'Prefer import.meta.dir for the current module directory.' },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.optional
          || node.arguments.length !== 1
          || !isBuiltin(context, node.callee, 'path', 'dirname')
        ) {
          return;
        }
        const [conversion] = node.arguments;
        if (
          conversion?.type !== 'CallExpression'
          || conversion.optional
          || conversion.arguments.length !== 1
          || !isBuiltin(context, conversion.callee, 'url', 'fileURLToPath')
        ) {
          return;
        }
        const [url] = conversion.arguments;
        if (
          url?.type !== 'MemberExpression'
          || url.optional
          || url.computed
          || url.property.type !== 'Identifier'
          || url.property.name !== 'url'
          || url.object.type !== 'MetaProperty'
          || url.object.meta.name !== 'import'
          || url.object.property.name !== 'meta'
        ) {
          return;
        }
        context.report({ node, messageId: 'preferBun' });
      },
    };
  },
} satisfies Rule.RuleModule;
