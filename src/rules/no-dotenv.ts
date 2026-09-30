import { propertyName, resolveBuiltin } from '../utils/imports.js';

import type { Rule } from 'eslint';
import type { CallExpression, Node } from 'estree';

const isConfigModule = (source: unknown): boolean =>
  source === 'dotenv/config' || source === 'dotenv/config.js';

// `config()` and `configDotenv()` load the same files; `quiet` and `debug` only change logging.
const configFunctions = new Set(['config', 'configDotenv']);
const loggingOptions = new Set(['quiet', 'debug']);

function hasDefaultOptions(args: CallExpression['arguments']): boolean {
  const [options] = args;
  if (!options) {
    return true;
  }
  return (
    args.length === 1
    && options.type === 'ObjectExpression'
    && options.properties.every(
      (property) =>
        property.type === 'Property'
        && loggingOptions.has(propertyName(property.key, property.computed) ?? ''),
    )
  );
}

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Avoid redundant dotenv initialization when targeting Bun.',
      url: 'https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/no-dotenv.md',
    },
    schema: [],
    messages: {
      noDotenv:
        'Bun loads standard environment files automatically; this dotenv initialization may be redundant.',
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const declaration = node as typeof node & { importKind?: string };
        if (
          isConfigModule(node.source.value)
          && declaration.importKind !== 'type'
          && !node.specifiers.some(
            (specifier) => (specifier as typeof specifier & { importKind?: string }).importKind === 'type',
          )
        ) {
          context.report({ node, messageId: 'noDotenv' });
        }
      },
      ImportExpression(node) {
        if (node.source.type === 'Literal' && isConfigModule(node.source.value)) {
          context.report({ node, messageId: 'noDotenv' });
        }
      },
      CallExpression(node) {
        const required = resolveBuiltin(context, node);
        const reference = resolveBuiltin(context, node.callee);
        if (
          (required?.path.length === 0 && isConfigModule(required.module))
          // A used return value (`parsed`, `error`) has no Bun equivalent, so only bare calls are reported.
          || (reference?.module === 'dotenv'
            && configFunctions.has(reference.path.join('.'))
            && node.parent.type === 'ExpressionStatement'
            && hasDefaultOptions(node.arguments))
        ) {
          context.report({ node: node.callee as Node, messageId: 'noDotenv' });
        }
      },
    };
  },
} satisfies Rule.RuleModule;
