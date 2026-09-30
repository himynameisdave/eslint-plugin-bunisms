import { resolveBuiltin, variableFor } from '../utils/imports.js';

import type { Rule } from 'eslint';
import type { Node } from 'estree';

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Warn about direct writes to file-level variables in concurrent Bun tests.',
      url: 'https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/no-concurrent-test-shared-state.md',
    },
    schema: [],
    messages: {
      sharedState: 'Concurrent tests mutate shared state; isolate state within each test.',
    },
  },
  create(context) {
    const callbacks = new Set<Node>();
    const active: boolean[] = [];
    const enter = (node: Node) => active.push(callbacks.has(node));
    const exit = () => {
      active.pop();
    };
    return {
      'CallExpression'(node) {
        // Only .each has a supported factory call; do not infer conditional qualifiers.
        const { callee } = node;
        const factory = callee.type === 'CallExpression';
        const reference = resolveBuiltin(context, factory ? callee.callee : callee);
        if (reference?.module !== 'bun:test') {
          return;
        }
        const [name, ...qualifiers] = reference.path;
        if (factory && qualifiers.pop() !== 'each') {
          return;
        }
        if (
          (name !== 'test' && name !== 'it')
          || !qualifiers.includes('concurrent')
          || !qualifiers.every((qualifier) => ['concurrent', 'only', 'failing'].includes(qualifier))
        ) {
          return;
        }
        const callback = node.arguments[1] ?? node.arguments[0];
        if (callback?.type === 'ArrowFunctionExpression' || callback?.type === 'FunctionExpression') {
          callbacks.add(callback);
        }
      },
      // A nested function may never run, or may be protected by a synchronization helper.
      // Class fields are also deferred; skip the whole class conservatively.
      ':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression, ClassDeclaration, ClassExpression)':
        enter,
      ':matches(FunctionDeclaration, FunctionExpression, ArrowFunctionExpression, ClassDeclaration, ClassExpression):exit':
        exit,
      'Identifier'(node) {
        if (!active.at(-1)) {
          return;
        }
        const variable = variableFor(context, node);
        // Program also represents the CommonJS wrapper's variable scope.
        if (
          variable?.scope.block.type !== 'Program'
          || !variable.defs.some((definition) => definition.type === 'Variable')
        ) {
          return;
        }
        if (
          variable.references.some(
            (reference) => reference.identifier === node && reference.isWrite() && !reference.init,
          )
        ) {
          context.report({ node, messageId: 'sharedState' });
        }
      },
    };
  },
} satisfies Rule.RuleModule;
