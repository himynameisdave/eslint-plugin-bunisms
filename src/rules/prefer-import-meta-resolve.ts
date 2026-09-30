import { propertyName, variableFor } from '../utils/imports.js';

import type { Rule } from 'eslint';
import type { Node, MemberExpression } from 'estree';

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Consider import.meta.resolve for module resolution in Bun ESM.',
      url: 'https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-import-meta-resolve.md',
    },
    schema: [],
    messages: {
      preferImportMetaResolve: 'Consider import.meta.resolve for module resolution in Bun ESM.',
    },
  },
  create(context) {
    if (context.sourceCode.ast.sourceType !== 'module' || /\.c(?:js|ts)$/iu.test(context.filename)) {
      return {};
    }
    const candidates: MemberExpression[] = [];
    let excluded = false;
    function global(node: Node, name: string): boolean {
      return node.type === 'Identifier' && node.name === name && !variableFor(context, node)?.defs.length;
    }
    function checkWrite(target: Node): void {
      let node = target;
      // Ignore the whole file if require or any of its properties is visibly changed.
      while (node.type === 'MemberExpression') {
        node = node.object;
      }
      if (global(node, 'require')) {
        excluded = true;
      }
      // Destructuring assignment can also replace the global require binding.
      if (node.type === 'ObjectPattern') {
        for (const property of node.properties) {
          checkWrite(property.type === 'RestElement' ? property.argument : property.value);
        }
      } else if (node.type === 'ArrayPattern') {
        for (const element of node.elements) {
          if (element) {
            checkWrite(element);
          }
        }
      } else if (node.type === 'RestElement') {
        checkWrite(node.argument);
      } else if (node.type === 'AssignmentPattern') {
        checkWrite(node.left);
      }
    }
    return {
      'MemberExpression'(node) {
        // Flat config defaults to ESM even for .js files using CommonJS exports.
        if (
          global(node.object, 'module')
          || global(node.object, 'exports')
          || (global(node.object, 'require') && propertyName(node.property, node.computed) === 'main')
        ) {
          excluded = true;
        }
      },
      'TSExportAssignment'() {
        excluded = true;
      },
      'AssignmentExpression'(node) {
        checkWrite(node.left);
      },
      'UpdateExpression'(node) {
        checkWrite(node.argument);
      },
      'UnaryExpression'(node) {
        if (node.operator === 'delete') {
          checkWrite(node.argument);
        }
      },
      'ForInStatement'(node) {
        checkWrite(node.left);
      },
      'ForOfStatement'(node) {
        checkWrite(node.left);
      },
      'CallExpression'(node) {
        const { callee } = node;
        const [specifier] = node.arguments;
        if (
          node.optional
          || callee.type !== 'MemberExpression'
          || callee.optional
          || !global(callee.object, 'require')
          || propertyName(callee.property, callee.computed) !== 'resolve'
          || node.arguments.length !== 1
          || specifier?.type !== 'Literal'
          || typeof specifier.value !== 'string'
          || specifier.value.length === 0
          || /[#?%]/u.test(specifier.value)
        ) {
          return;
        }
        candidates.push(callee);
      },
      'Program:exit'() {
        if (!excluded) {
          for (const node of candidates) {
            context.report({ node, messageId: 'preferImportMetaResolve' });
          }
        }
      },
    };
  },
};

export default rule;
