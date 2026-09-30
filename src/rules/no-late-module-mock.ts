import { isTypeOnly, resolveBuiltin } from '../utils/imports.js';

import type { Rule } from 'eslint';
import type { ImportDeclaration, Node, Program } from 'estree';

// ESTree types omit TypeScript's `import foo = require('./foo')`.
type ImportEquals = {
  type: 'TSImportEqualsDeclaration';
  importKind?: string;
  moduleReference: { type: string; expression?: Node };
};

function staticString(node: Node | null | undefined): string | undefined {
  if (node?.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }
  if (node?.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis[0]?.value.cooked ?? undefined;
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
    const typescript = /\.[cm]?tsx?$/u.test(context.filename);
    // Bun drops TypeScript imports whose bindings are never used as values.
    const isDropped = (declaration: ImportDeclaration) =>
      typescript
      && declaration.specifiers.length > 0
      && context.sourceCode
        .getDeclaredVariables(declaration)
        .every((variable) =>
          variable.references.every(
            (reference) => (reference as { isValueReference?: boolean }).isValueReference === false,
          ),
        );
    const loadedModule = (statement: Program['body'][number] | ImportEquals) => {
      const specifiers = 'specifiers' in statement ? statement.specifiers : [];
      if (
        isTypeOnly(statement)
        || (specifiers.length > 0 && specifiers.every((specifier) => isTypeOnly(specifier)))
      ) {
        return;
      }
      if (statement.type === 'ImportDeclaration') {
        return isDropped(statement) ? undefined : staticString(statement.source);
      }
      if (statement.type === 'ExportAllDeclaration' || statement.type === 'ExportNamedDeclaration') {
        return staticString(statement.source);
      }
      if (
        statement.type === 'TSImportEqualsDeclaration'
        && statement.moduleReference.type === 'TSExternalModuleReference'
      ) {
        return staticString(statement.moduleReference.expression);
      }
    };
    return {
      Program(node) {
        for (const statement of node.body as (Program['body'][number] | ImportEquals)[]) {
          const source = loadedModule(statement);
          if (source !== undefined) {
            staticImports.add(source);
          }
        }
      },
      CallExpression(node) {
        const reference = resolveBuiltin(context, node.callee);
        // `vi.mock` is Bun's Vitest-compatible alias for `mock.module`, and Bun does not hoist it.
        if (
          reference?.module !== 'bun:test'
          || !['mock.module', 'vi.mock'].includes(reference.path.join('.'))
        ) {
          return;
        }
        const [source] = node.arguments;
        const value = staticString(source);
        if (source && value !== undefined && staticImports.has(value)) {
          context.report({ node: source, messageId: 'lateModuleMock' });
        }
      },
    };
  },
} satisfies Rule.RuleModule;
