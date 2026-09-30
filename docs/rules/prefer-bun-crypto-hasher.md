# prefer-bun-crypto-hasher

📝 Prefer `Bun.CryptoHasher` for cryptographic hashing when targeting Bun.

⚠️ This rule _warns_ in the following [configs](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint): ✅ `recommended`, 🔒 `strict`, 🌐 `all`.

[`Bun.CryptoHasher`](https://bun.sh/docs/runtime/hashing#buncryptohasher) incrementally computes cryptographic digests and supports common Node hash algorithms. The rule reports direct `node:crypto` or `crypto` `createHash()` chains that call `.update()` and finish with `.digest('hex' | 'base64' | 'base64url')`. It recognizes named, aliased, default and namespace imports, plus direct CommonJS `require()` forms. It does not report HMAC, unsupported or dynamic algorithms, variable-held hash instances, unencoded digests, or other digest encodings. Shadowed and visibly modified bindings are excluded.

The diagnostic has no automatic fix or suggestion. The reported boundary uses algorithms and update encodings documented for `Bun.CryptoHasher`, and string encodings whose output is supported by both APIs. It requires one literal algorithm and an explicit compatible digest encoding: Node's unencoded digest returns a `Buffer`, whereas Bun returns a `Uint8Array`. The rule does not report XOF algorithms because output-length behavior can differ. Keep Node's API when code must run on Node, needs `Hash` stream behavior, depends on `Buffer` semantics, uses unsupported algorithms or encodings, or needs `createHash()` options. [`Bun.hash`](https://bun.sh/docs/runtime/hashing#bunhash) is non-cryptographic and is not a replacement. Bun 1.4.0 or later is the project's supported baseline.

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

// ✅ Keep the Node API if Buffer output is required
import { createHash } from 'node:crypto';
const bytes = createHash('sha256').update(data).digest();
```
