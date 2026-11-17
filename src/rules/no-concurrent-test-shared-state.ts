import { isGlobal, propertyName, resolveBuiltin, variableFor } from '../utils/imports.js';

import type { Rule } from 'eslint';
import type { Node } from 'estree';

type ParentNode = Node & { parent?: ParentNode };

// The path below bun:test, such as ['test', 'concurrent'], including Bun's `test` and `it` globals.
function testPath(context: Rule.RuleContext, node: Node): string[] | undefined {
  const reference = resolveBuiltin(context, node);
  if (reference) {
    return reference.module === 'bun:test' ? reference.path : undefined;
  }
  if (node.type === 'MemberExpression') {
    const property = propertyName(node.property, node.computed);
    const object = testPath(context, node.object);
    return property === undefined || !object ? undefined : [...object, property];
  }
  if (
    node.type === 'Identifier'
    && (node.name === 'test' || node.name === 'it')
    && isGlobal(context, node, node.name)
  ) {
    return [node.name];
  }
}

// The function whose call runs this node. Methods and instance field initializers run later,
// so they belong to no test callback; static blocks, static fields, computed keys and `extends` run now.
function enclosingFunction(node: Node): Node | undefined {
  let child = node;
  for (let current = (node as ParentNode).parent; current; child = current, current = current.parent) {
    if (
      current.type === 'ArrowFunctionExpression'
      || current.type === 'FunctionExpression'
      || current.type === 'FunctionDeclaration'
    ) {
      return current;
    }
    if (current.type === 'PropertyDefinition' && !current.static && current.value === child) {
      return;
    }
  }
}

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
    return {
      CallExpression(node) {
        // Only .each has a supported factory call; do not infer conditional qualifiers.
        const { callee } = node;
        let factory: Node | undefined;
        if (callee.type === 'CallExpression') {
          factory = callee.callee;
        } else if (callee.type === 'TaggedTemplateExpression') {
          factory = callee.tag;
        }
        const [name, ...qualifiers] = testPath(context, factory ?? callee) ?? [];
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
        // Bun accepts (fn), (name, fn), (fn, timeout) and (name, options, fn).
        const callback = node.arguments.find(
          (argument) =>
            argument.type === 'ArrowFunctionExpression' || argument.type === 'FunctionExpression',
        );
        if (callback) {
          callbacks.add(callback);
        }
      },
      Identifier(node) {
        // A nested function may never run, or may be protected by a synchronization helper.
        const callback = enclosingFunction(node);
        if (!callback || !callbacks.has(callback)) {
          return;
        }
        const reference = context.sourceCode
          .getScope(node)
          .references.find(({ identifier }) => identifier === node);
        if (!reference?.isWrite()) {
          return;
        }
        const variable = variableFor(context, node);
        // Program also represents the CommonJS wrapper's variable scope.
        if (
          variable?.scope.block.type === 'Program'
          && variable.defs.some(
            ({ type }) => type === 'Variable' || type === 'FunctionName' || type === 'ClassName',
          )
        ) {
          context.report({ node, messageId: 'sharedState' });
        }
      },
    };
  },
} satisfies Rule.RuleModule;
