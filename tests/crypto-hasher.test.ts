import { describe, expect, test } from 'bun:test';

// Recorded from real Node 22.22.2. Under `bun test`, node:crypto is Bun's own, so it can't be the reference.
const nodeDigests = {
  'sha256': {
    hex: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
    base64: 'uU0nuZNNPgilLlLX2n2r+sSE7+N6U4DukIj3rOLvzek=',
    base64url: 'uU0nuZNNPgilLlLX2n2r-sSE7-N6U4DukIj3rOLvzek',
  },
  'sha3-256': {
    hex: '644bcc7e564373040999aac89e7622f3ca71fba1d972fd94a31c3bfbf24e3938',
    base64: 'ZEvMflZDcwQJmarInnYi88px+6HZcv2Uoxw7+/JOOTg=',
    base64url: 'ZEvMflZDcwQJmarInnYi88px-6HZcv2Uoxw7-_JOOTg',
  },
};

describe('Bun.CryptoHasher matches Node createHash for documented digest chains', () => {
  for (const algorithm of ['sha256', 'sha3-256'] as const) {
    for (const encoding of ['hex', 'base64', 'base64url'] as const) {
      test(`${algorithm} ${encoding}`, () => {
        const bunDigest = new Bun.CryptoHasher(algorithm)
          .update('68656c6c6f', 'hex')
          // oxlint-disable-next-line unicorn/text-encoding-identifier-case -- The rule accepts this spelling.
          .update(' world', 'utf-8')
          .digest(encoding);
        expect(bunDigest).toBe(nodeDigests[algorithm][encoding]);
      });
    }
  }
  test('digest() returns a Buffer, like Node', () => {
    expect(Buffer.isBuffer(new Bun.CryptoHasher('sha256').update('hello').digest())).toBe(true);
  });
});
