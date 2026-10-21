import { isGlobal, propertyName, resolveBuiltin } from '../utils/imports.js';

import type { Rule } from 'eslint';
import type { CallExpression, Node } from 'estree';

type ParentNode = Node & { parent?: ParentNode };

// Bun's test globals include these, but not spyOn or mock.
const globals = new Set(['describe', 'xdescribe', 'afterEach', 'jest', 'vi']);

function bunTestCall(context: Rule.RuleContext, node: Node, name: string): boolean {
  const reference = resolveBuiltin(context, node);
  if (reference) {
    return reference.module === 'bun:test' && reference.path.join('.') === name;
  }
  // Members of a global, such as jest.restoreAllMocks.
  if (node.type === 'MemberExpression') {
    const property = propertyName(node.property, node.computed);
    return (
      property !== undefined
      && name.endsWith(`.${property}`)
      && bunTestCall(context, node.object, name.slice(0, -property.length - 1))
    );
  }
  return globals.has(name) && isGlobal(context, node, name);
}

// Restores every mock, or (leniently) one spy via spy.mockRestore().
function isRestore(context: Rule.RuleContext, node: CallExpression): boolean {
  const { callee } = node;
  return (
    ['mock.restore', 'jest.restoreAllMocks', 'vi.restoreAllMocks'].some((name) =>
      bunTestCall(context, callee, name),
    )
    || (callee.type === 'MemberExpression'
      && propertyName(callee.property, callee.computed) === 'mockRestore')
  );
}

// Unwrap modifiers such as describe.only(), describe.each(table)() and describe.if(condition)().
function isDescribe(context: Rule.RuleContext, node: Node): boolean {
  if (bunTestCall(context, node, 'describe') || bunTestCall(context, node, 'xdescribe')) {
    return true;
  }
  if (node.type === 'CallExpression') {
    return isDescribe(context, node.callee);
  }
  return node.type === 'MemberExpression' && isDescribe(context, node.object);
}

function describeScopes(context: Rule.RuleContext, node: ParentNode): Node[] {
  const scopes: Node[] = [];
  let current: ParentNode | undefined = node;
  while (current) {
    if (current.type === 'CallExpression' && isDescribe(context, current.callee)) {
      scopes.unshift(current);
    }
    current = current.parent;
  }
  return scopes;
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Restore Bun mocks in an afterEach hook to isolate tests.',
      url: 'https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-mock-restore-in-after-each.md',
    },
    schema: [],
    messages: {
      restore: 'Restore Bun mocks in an afterEach hook to isolate tests.',
    },
  },
  create(context) {
    const spies: CallExpression[] = [];
    const cleanupScopes: Node[][] = [];
    return {
      'CallExpression'(node) {
        if (bunTestCall(context, node.callee, 'spyOn')) {
          spies.push(node);
        }
        if (!isRestore(context, node)) {
          return;
        }
        // Only a restore made directly in the afterEach callback counts, not one in a nested function.
        let callback = (node as ParentNode).parent;
        while (
          callback
          && callback.type !== 'ArrowFunctionExpression'
          && callback.type !== 'FunctionExpression'
          && callback.type !== 'FunctionDeclaration'
        ) {
          callback = callback.parent;
        }
        const hook = callback?.parent;
        if (
          hook?.type === 'CallExpression'
          && hook.arguments[0] === callback
          && bunTestCall(context, hook.callee, 'afterEach')
        ) {
          cleanupScopes.push(describeScopes(context, hook));
        }
      },
      'Program:exit'() {
        for (const spy of spies) {
          const scopes = describeScopes(context, spy as ParentNode);
          const hasCleanup = cleanupScopes.some(
            (cleanup) =>
              cleanup.length <= scopes.length && cleanup.every((scope, index) => scopes[index] === scope),
          );
          if (!hasCleanup) {
            context.report({ node: spy.callee, messageId: 'restore' });
          }
        }
      },
    };
  },
} satisfies Rule.RuleModule;
