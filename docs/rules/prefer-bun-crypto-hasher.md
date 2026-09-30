# prefer-bun-crypto-hasher

📝 Prefer `Bun.CryptoHasher` for cryptographic hashing when targeting Bun.

⚠️ This rule _warns_ in the following [configs](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint): ✅ `recommended`, 🔒 `strict`, 🌐 `all`.

[`Bun.CryptoHasher`](https://bun.sh/docs/runtime/hashing#buncryptohasher) incrementally computes cryptographic digests and supports common Node hash algorithms. The rule reports direct `node:crypto` or `crypto` `createHash()` chains that call `.update()` and finish with `.digest()` or `.digest('hex' | 'base64' | 'base64url')`. It recognizes named, aliased, default and namespace imports, plus direct CommonJS `require()` forms. It does not report HMAC, unsupported or dynamic algorithms, variable-held hash instances, or other digest encodings. Shadowed and visibly modified bindings are excluded.

The diagnostic has no automatic fix or suggestion. It only reports algorithms and update encodings that give the same digest on Node and Bun, so it skips `blake2b256` and `md4` (Node rejects them) and `'utf-16le'` input (Bun hashes it differently). It requires one literal algorithm. Both APIs return a `Buffer` from `digest()` with no encoding. The rule does not report XOF algorithms because output-length behavior can differ. Keep Node's API when code must run on Node, needs `Hash` stream behavior, uses unsupported algorithms or encodings, or needs `createHash()` options. [`Bun.hash`](https://bun.sh/docs/runtime/hashing#bunhash) is non-cryptographic and is not a replacement. Bun 1.4.0 or later is the project's supported baseline.

## Examples

```js
// ❌
import { createHash } from 'node:crypto';
const digest = createHash('sha256').update(data).digest('hex');

// ✅
const digest = new Bun.CryptoHasher('sha256').update(data).digest('hex');
```

```js
// ✅ Keep HMAC on the cryptographic hash API
import { createHmac } from 'node:crypto';
const digest = createHmac('sha256', key).update(data).digest('hex');
```
