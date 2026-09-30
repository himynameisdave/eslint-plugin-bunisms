import { resolveBuiltin, variableFor } from '../utils/imports.js';

import type { Rule } from 'eslint';
import type { CallExpression, Node } from 'estree';

type ParentNode = Node & { parent?: ParentNode };

function bunTestCall(context: Rule.RuleContext, node: CallExpression['callee'], name: string): boolean {
  const reference = resolveBuiltin(context, node);
  if (reference) {
    return reference.module === 'bun:test' && reference.path.join('.') === name;
  }
  // Bun exposes these APIs as globals. Locally declared or imported names are never assumed global.
  const variable = node.type === 'Identifier' ? variableFor(context, node) : undefined;
  return node.type === 'Identifier' && node.name === name && (!variable || variable.defs.length === 0);
}

function describeScopes(context: Rule.RuleContext, node: ParentNode): Node[] {
  const scopes: Node[] = [];
  let current: ParentNode | undefined = node;
  while (current) {
    if (current.type === 'CallExpression' && bunTestCall(context, current.callee, 'describe')) {
      scopes.unshift(current);
    }
    current = current.parent;
  }
  return scopes;
}

function restoresMocks(context: Rule.RuleContext, node: Node): boolean {
  if (node.type !== 'CallExpression' || node.callee.type !== 'MemberExpression') {
    return false;
  }
  const reference = resolveBuiltin(context, node.callee);
  return reference?.module === 'bun:test' && reference.path.join('.') === 'mock.restore';
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
        if (!bunTestCall(context, node.callee, 'afterEach')) {
          return;
        }
        const [callback] = node.arguments;
        if (
          !callback
          || (callback.type !== 'ArrowFunctionExpression' && callback.type !== 'FunctionExpression')
        ) {
          return;
        }
        let restores = false;
        const visit = (candidate: Node): void => {
          if (
            candidate !== callback.body
            && (candidate.type === 'ArrowFunctionExpression'
              || candidate.type === 'FunctionExpression'
              || candidate.type === 'FunctionDeclaration')
          ) {
            return;
          }
          if (restoresMocks(context, candidate)) {
            restores = true;
          }
          for (const [key, value] of Object.entries(candidate)) {
            if (key === 'parent') {
              continue;
            }
            if (Array.isArray(value)) {
              for (const child of value) {
                if (child && typeof child === 'object' && 'type' in child) {
                  visit(child as Node);
                }
              }
            } else if (value && typeof value === 'object' && 'type' in value) {
              visit(value as Node);
            }
          }
        };
        visit(callback.body);
        if (restores) {
          cleanupScopes.push(describeScopes(context, node as ParentNode));
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
