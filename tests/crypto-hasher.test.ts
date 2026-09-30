import { describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';

describe('Bun.CryptoHasher matches Node createHash for documented digest chains', () => {
  for (const algorithm of ['sha256', 'sha3-256', 'blake2b256'] as const) {
    for (const encoding of ['hex', 'base64', 'base64url'] as const) {
      test(`${algorithm} ${encoding}`, () => {
        const nodeDigest = createHash(algorithm).update('68656c6c6f', 'hex').update(' world').digest(encoding);
        const bunDigest = new Bun.CryptoHasher(algorithm).update('68656c6c6f', 'hex').update(' world').digest(encoding);
        expect(bunDigest).toBe(nodeDigest);
      });
    }
  }
});
