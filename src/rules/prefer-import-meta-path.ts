import { resolveBuiltin } from '../utils/imports.js';

import type { Rule } from 'eslint';
import type { Node } from 'estree';

function isImportMetaUrl(node: Node | null | undefined): boolean {
  if (node?.type !== 'MemberExpression' || node.computed) {
    return false;
  }
  const { object, property } = node;
  return (
    object.type === 'MetaProperty'
    && object.meta.name === 'import'
    && object.property.name === 'meta'
    && property.type === 'Identifier'
    && property.name === 'url'
  );
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer import.meta.path to convert the current module URL to a filesystem path.',
      url: 'https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-import-meta-path.md',
    },
    schema: [],
    messages: { preferImportMetaPath: 'Prefer import.meta.path for the current module path.' },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (node.arguments.length !== 1 || !isImportMetaUrl(node.arguments[0] as Node | undefined)) {
          return;
        }
        const reference = resolveBuiltin(context, node.callee);
        if (reference?.module !== 'url' || reference.path.join('.') !== 'fileURLToPath') {
          return;
        }
        context.report({ node, messageId: 'preferImportMetaPath' });
      },
    };
  },
};

export default rule;
