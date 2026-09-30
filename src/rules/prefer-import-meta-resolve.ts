import { isGlobal, propertyName } from '../utils/imports.js';

import type { Rule } from 'eslint';
import type { Node, MemberExpression } from 'estree';

// TypeScript wrappers that keep the runtime value, e.g. `(require as any)`.
const typeWrappers = new Set([
  'TSAsExpression',
  'TSNonNullExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
]);

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
    // Oxlint parses .js/.ts files without import/export as scripts, so only skip known CommonJS.
    if (context.languageOptions.sourceType === 'commonjs' || /\.c[jt]s$/iu.test(context.filename)) {
      return {};
    }
    const candidates: MemberExpression[] = [];
    let excluded = false;
    // Flat config defaults to ESM even for .js files using CommonJS, so any unshadowed
    // module or exports reference (even `typeof exports`) marks the file as CommonJS.
    function usesCommonJsGlobals(): boolean {
      const scope = context.sourceCode.scopeManager.globalScope;
      return ['module', 'exports'].some((name) => {
        const variable = scope?.set.get(name);
        return (
          scope?.through.some((reference) => reference.identifier.name === name)
          || (variable?.defs.length === 0 && variable.references.length > 0)
        );
      });
    }
    function checkWrite(target: Node): void {
      let node = target;
      // Ignore the whole file if require or any of its properties is visibly changed.
      while (node.type === 'MemberExpression' || typeWrappers.has(node.type)) {
        node =
          node.type === 'MemberExpression'
            ? node.object
            : (node as unknown as { expression: Node }).expression;
      }
      if (isGlobal(context, node, 'require')) {
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
        if (
          isGlobal(context, node.object, 'require')
          && propertyName(node.property, node.computed) === 'main'
        ) {
          excluded = true;
        }
      },
      'TSExportAssignment'() {
        excluded = true;
      },
      'TSImportEqualsDeclaration'(node: { moduleReference: { type: string } }) {
        // `import x = require('y')` only compiles to CommonJS; `import x = A.B` is a namespace alias.
        if (node.moduleReference.type === 'TSExternalModuleReference') {
          excluded = true;
        }
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
          || !isGlobal(context, callee.object, 'require')
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
        if (!excluded && !usesCommonJsGlobals()) {
          for (const node of candidates) {
            context.report({ node, messageId: 'preferImportMetaResolve' });
          }
        }
      },
    };
  },
};

export default rule;
