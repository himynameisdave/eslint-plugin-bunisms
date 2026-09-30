import { propertyName, resolveBuiltin } from '../utils/imports.js';

import type { Rule } from 'eslint';
import type { CallExpression, Expression, Node } from 'estree';

const algorithms = new Set([
  'blake2b256',
  'blake2b512',
  'blake2s256',
  'md4',
  'md5',
  'ripemd160',
  'sha1',
  'sha224',
  'sha256',
  'sha384',
  'sha512',
  'sha512-224',
  'sha512-256',
  'sha3-224',
  'sha3-256',
  'sha3-384',
  'sha3-512',
]);
const encodings = new Set([
  'ascii',
  'base64',
  'base64url',
  'binary',
  'hex',
  'latin1',
  'ucs2',
  'ucs-2',
  'utf8',
  'utf16le',
]);
const digestEncodings = new Set(['base64', 'base64url', 'hex']);

function isCall(node: Node): node is CallExpression {
  return node.type === 'CallExpression';
}

function memberCall(node: Expression, method: string): CallExpression | undefined {
  if (node.type !== 'CallExpression' || node.optional || node.callee.type !== 'MemberExpression') {
    return;
  }
  if (propertyName(node.callee.property, node.callee.computed) === method) {
    return node;
  }
}

function isStringIn(node: Node | undefined, values: Set<string>): boolean {
  return node?.type === 'Literal' && typeof node.value === 'string' && values.has(node.value);
}

function isSupportedUpdate(call: CallExpression): boolean {
  if (call.arguments.length === 0 || call.arguments.length > 2) {
    return false;
  }
  const [data, encoding] = call.arguments;
  return data?.type !== 'SpreadElement' && (!encoding || isStringIn(encoding, encodings));
}

function isSupportedCreateHash(context: Rule.RuleContext, call: CallExpression): boolean {
  if (call.arguments.length !== 1 || call.arguments[0]?.type === 'SpreadElement') {
    return false;
  }
  const reference = resolveBuiltin(context, call.callee);
  return Boolean(
    reference
    && reference.module === 'crypto'
    && reference.path.length === 1
    && reference.path[0] === 'createHash'
    && isStringIn(call.arguments[0], algorithms),
  );
}

function isCryptoHashChain(context: Rule.RuleContext, digest: CallExpression): boolean {
  // Node returns a Buffer when digest() has no encoding, while CryptoHasher returns a Uint8Array.
  if (digest.arguments.length !== 1 || !isStringIn(digest.arguments[0], digestEncodings)) {
    return false;
  }
  let current: Node = digest.callee.type === 'MemberExpression' ? digest.callee.object : digest;
  let updateCount = 0;
  while (isCall(current)) {
    const update = memberCall(current, 'update');
    if (!update || !isSupportedUpdate(update)) {
      return false;
    }
    updateCount++;
    const target = update.callee.type === 'MemberExpression' ? update.callee.object : undefined;
    if (!target || !isCall(target)) {
      return false;
    }
    if (isSupportedCreateHash(context, target)) {
      return updateCount > 0;
    }
    current = target;
  }
  return false;
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer Bun.CryptoHasher for cryptographic hashing when targeting Bun.',
      url: 'https://github.com/himynameisdave/eslint-plugin-bunisms/blob/main/docs/rules/prefer-bun-crypto-hasher.md',
    },
    schema: [],
    messages: {
      preferBunCryptoHasher: 'Consider Bun.CryptoHasher for cryptographic hashing when targeting Bun.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (memberCall(node, 'digest') && isCryptoHashChain(context, node)) {
          context.report({ node, messageId: 'preferBunCryptoHasher' });
        }
      },
    };
  },
};

export default rule;
