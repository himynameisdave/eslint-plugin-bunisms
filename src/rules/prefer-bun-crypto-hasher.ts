import { propertyName, resolveBuiltin } from '../utils/imports.js';

import type { Rule } from 'eslint';
import type { CallExpression, MemberExpression, Node } from 'estree';

// Only algorithms and update encodings that give the same digest on Node and Bun:
// Node rejects blake2b256 and md4, and Bun hashes 'utf-16le' input differently.
const algorithms = new Set([
  'blake2b512',
  'blake2s256',
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
  // oxlint-disable-next-line unicorn/text-encoding-identifier-case -- Node code uses both spellings.
  'utf-8',
  'utf16le',
]);
const digestEncodings = new Set(['base64', 'base64url', 'hex']);

type MemberCall = CallExpression & { callee: MemberExpression };

function memberCall(node: Node, method: string): MemberCall | undefined {
  if (
    node.type === 'CallExpression'
    && node.callee.type === 'MemberExpression'
    && propertyName(node.callee.property, node.callee.computed) === method
  ) {
    return node as MemberCall;
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

function isSupportedCreateHash(context: Rule.RuleContext, node: Node): boolean {
  if (
    node.type !== 'CallExpression'
    || node.arguments.length !== 1
    || !isStringIn(node.arguments[0], algorithms)
  ) {
    return false;
  }
  const reference = resolveBuiltin(context, node.callee);
  return reference?.module === 'crypto' && reference.path.join('.') === 'createHash';
}

function isCryptoHashChain(context: Rule.RuleContext, digest: MemberCall): boolean {
  const [encoding] = digest.arguments;
  if (digest.arguments.length > 1 || (encoding && !isStringIn(encoding, digestEncodings))) {
    return false;
  }
  let update = memberCall(digest.callee.object, 'update');
  while (update && isSupportedUpdate(update)) {
    if (isSupportedCreateHash(context, update.callee.object)) {
      return true;
    }
    update = memberCall(update.callee.object, 'update');
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
        const digest = memberCall(node, 'digest');
        if (digest && isCryptoHashChain(context, digest)) {
          context.report({ node, messageId: 'preferBunCryptoHasher' });
        }
      },
    };
  },
};

export default rule;
