import { resolveBuiltin, variableFor } from '../utils/imports.js';

import type { Rule } from 'eslint';
import type { Expression, Identifier } from 'estree';

function rootIdentifier(node: Expression): Identifier | undefined {
  if (node.type === 'Identifier') {
    return node;
  }
  if (node.type === 'MemberExpression') {
    return node.object.type === 'Super' ? undefined : rootIdentifier(node.object);
  }
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Warn when a statically imported module is mocked after it can run side effects.',
      url: 'https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/no-late-module-mock.md',
    },
    schema: [],
    messages: {
      lateModuleMock:
        'This module was statically imported before the mock; its original side effects may already have run.',
    },
  },
  create(context) {
    const staticImports = new Set<string>();
    return {
      Program(node) {
        for (const statement of node.body) {
          if (statement.type !== 'ImportDeclaration' || typeof statement.source.value !== 'string') {
            continue;
          }
          const declaration = statement as typeof statement & { importKind?: string };
          if (
            declaration.importKind === 'type'
            || (statement.specifiers.length > 0
              && statement.specifiers.every(
                (specifier) =>
                  (specifier as typeof specifier & { importKind?: string }).importKind === 'type',
              ))
          ) {
            continue;
          }
          staticImports.add(statement.source.value);
        }
      },
      CallExpression(node) {
        const reference = resolveBuiltin(context, node.callee);
        if (reference?.module !== 'bun:test' || reference.path.join('.') !== 'mock.module') {
          return;
        }
        const root = node.callee.type === 'Super' ? undefined : rootIdentifier(node.callee);
        if (root) {
          const definition = variableFor(context, root)?.defs[0];
          // `bun:test` namespace and named imports are documented; do not infer a default export.
          if (definition?.type === 'ImportBinding' && definition.node.type === 'ImportDefaultSpecifier') {
            return;
          }
        }
        const [source] = node.arguments;
        if (
          source?.type === 'Literal'
          && typeof source.value === 'string'
          && staticImports.has(source.value)
        ) {
          context.report({ node: source, messageId: 'lateModuleMock' });
        }
      },
    };
  },
} satisfies Rule.RuleModule;
