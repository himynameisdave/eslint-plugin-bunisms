import { resolveBuiltin } from '../utils/imports.js';

import type { Rule } from 'eslint';
import type { Node } from 'estree';

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Avoid redundant dotenv initialization when targeting Bun.',
      url: 'https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/no-dotenv.md',
    },
    schema: [],
    messages: {
      noDotenv:
        'Bun loads standard environment files automatically; this dotenv initialization may be redundant.',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const declaration = node as typeof node & { importKind?: string };
        if (
          node.source.value === 'dotenv/config'
          && declaration.importKind !== 'type'
          && !node.specifiers.some(
            (specifier) => (specifier as typeof specifier & { importKind?: string }).importKind === 'type',
          )
        ) {
          context.report({ node, messageId: 'noDotenv' });
        }
      },
      CallExpression(node) {
        const reference = resolveBuiltin(context, node.callee) ?? resolveBuiltin(context, node);
        if (
          (reference?.module === 'dotenv'
            && reference.path.length === 1
            && reference.path[0] === 'config'
            && node.arguments.length === 0)
          || (reference?.module === 'dotenv/config' && reference.path.length === 0)
        ) {
          context.report({ node: node.callee as Node, messageId: 'noDotenv' });
        }
      },
    };
  },
} satisfies Rule.RuleModule;
