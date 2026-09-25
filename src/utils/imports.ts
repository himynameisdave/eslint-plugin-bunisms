import type { Rule, Scope } from 'eslint';
import type { Node, Expression, Identifier } from 'estree';

type BoundNode = Node & { parent?: BoundNode };
export type BuiltinReference = { module: string; path: string[] };

function variableFor(context: Rule.RuleContext, node: Identifier): Scope.Variable | undefined {
  let scope: Scope.Scope | null = context.sourceCode.getScope(node);
  while (scope) {
    const variable = scope.set.get(node.name);
    if (variable) {
      return variable;
    }
    scope = scope.upper;
  }
}

function propertyName(node: Node, computed: boolean): string | undefined {
  if (!computed && node.type === 'Identifier') {
    return node.name;
  }
  if (node.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }
}

// A reassigned binding or visibly mutated module object is no longer trustworthy.
function isModified(variable: Scope.Variable): boolean {
  return variable.references.some((reference) => {
    if (reference.isWrite() && !reference.init) {
      return true;
    }
    let node = reference.identifier as BoundNode;
    while (node.parent?.type === 'MemberExpression' && node.parent.object === node) {
      node = node.parent;
    }
    const { parent } = node;
    return (
      (parent?.type === 'AssignmentExpression' && parent.left === node)
      || parent?.type === 'UpdateExpression'
      || (parent?.type === 'UnaryExpression' && parent.operator === 'delete')
    );
  });
}

/** Resolve only direct builtin imports/requires, never names alone or arbitrary aliases. */
export function resolveBuiltin(
  context: Rule.RuleContext,
  node: Expression | Node,
): BuiltinReference | undefined {
  if (node.type === 'MemberExpression') {
    const property = propertyName(node.property, node.computed);
    const object = resolveBuiltin(context, node.object);
    if (property && object) {
      return { ...object, path: [...object.path, property] };
    }
    return;
  }
  if (
    node.type === 'CallExpression'
    && node.callee.type === 'Identifier'
    && node.callee.name === 'require'
  ) {
    const variable = variableFor(context, node.callee);
    if (variable?.defs.length || node.arguments.length !== 1) {
      return;
    }
    const [source] = node.arguments;
    if (source?.type === 'Literal' && typeof source.value === 'string') {
      return { module: source.value.replace(/^node:/u, ''), path: [] };
    }
    return;
  }
  if (node.type !== 'Identifier') {
    return;
  }
  const variable = variableFor(context, node);
  if (!variable || variable.defs.length !== 1 || isModified(variable)) {
    return;
  }
  const [definition] = variable.defs;
  if (!definition) {
    return;
  }
  if (definition.type === 'ImportBinding') {
    const declaration = definition.parent;
    // Type-only imports cannot identify a runtime API.
    if (
      (declaration as Node & { importKind?: string }).importKind === 'type'
      || (definition.node as Node & { importKind?: string }).importKind === 'type'
    ) {
      return;
    }
    const source = declaration.source.value;
    if (typeof source !== 'string') {
      return;
    }
    const specifier = definition.node;
    const path =
      specifier.type === 'ImportSpecifier'
        ? [
            specifier.imported.type === 'Identifier'
              ? specifier.imported.name
              : String(specifier.imported.value),
          ]
        : [];
    return { module: source.replace(/^node:/u, ''), path };
  }
  if (definition.type !== 'Variable' || definition.parent.kind !== 'const') {
    return;
  }
  const { id, init } = definition.node;
  // Deliberately do not recurse through variables (alias/data-flow analysis is out of scope).
  if (!init || init.type !== 'CallExpression') {
    return;
  }
  const origin = resolveBuiltin(context, init);
  if (!origin) {
    return;
  }
  if (id.type === 'Identifier') {
    return origin;
  }
  if (id.type === 'ObjectPattern') {
    const property = id.properties.find(
      (entry) =>
        entry.type === 'Property' && entry.value.type === 'Identifier' && entry.value.name === node.name,
    );
    if (property?.type !== 'Property') {
      return;
    }
    const name = propertyName(property.key, property.computed);
    if (name) {
      return { ...origin, path: [...origin.path, name] };
    }
  }
}
