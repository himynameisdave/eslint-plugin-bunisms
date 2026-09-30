import { isGlobal, propertyName } from '../utils/imports.js';

import type { Rule } from 'eslint';
import type { Node } from 'estree';

function member(node: Node, name: string): node is Extract<Node, { type: 'MemberExpression' }> {
  return (
    node.type === 'MemberExpression' && !node.optional && propertyName(node.property, node.computed) === name
  );
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer import.meta.main to check whether this module is the entrypoint.',
      url: 'https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-import-meta-main.md',
    },
    schema: [],
    messages: {
      preferBun: 'Prefer import.meta.main to check whether this module is the entrypoint.',
    },
  },
  create(context) {
    function pair(left: Node, right: Node): boolean {
      if (
        member(left, 'main')
        && isGlobal(context, left.object, 'require')
        && isGlobal(context, right, 'module')
      ) {
        return true;
      }
      return (
        member(left, 'path')
        && left.object.type === 'MetaProperty'
        && left.object.meta.name === 'import'
        && left.object.property.name === 'meta'
        && member(right, 'main')
        && isGlobal(context, right.object, 'Bun')
      );
    }
    return {
      BinaryExpression(node) {
        if (
          ['===', '!==', '==', '!='].includes(node.operator)
          && (pair(node.left, node.right) || pair(node.right, node.left))
        ) {
          context.report({ node, messageId: 'preferBun' });
        }
      },
    };
  },
};

export default rule;
