import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const directory = await mkdtemp(join(tmpdir(), 'bunisms-entrypoint-'));
try {
  for (const extension of ['js', 'ts', 'mjs', 'cjs']) {
    const file = join(directory, `entry.${extension}`);
    // Exercise ESM and explicit CommonJS, with both comparison directions and polarities.
    const source = `console.log(JSON.stringify([
      import.meta.main,
      require.main === module, module == require.main,
      import.meta.path === Bun.main, Bun.main == import.meta.path,
      require.main !== module, module != require.main,
      import.meta.path !== Bun.main, Bun.main != import.meta.path
    ])); ${extension === 'cjs' ? 'module.exports = {};' : ''}`;
    // oxlint-disable-next-line no-await-in-loop -- Each extension is verified in separate processes.
    await writeFile(file, source);
    for (const direct of [true, false]) {
      const args = direct ? [file] : ['-e', `await import(${JSON.stringify(file)})`];
      const result = Bun.spawnSync([process.execPath, ...args]);
      assert.equal(result.exitCode, 0, result.stderr.toString());
      assert.deepEqual(JSON.parse(result.stdout.toString()), [
        direct,
        direct,
        direct,
        direct,
        direct,
        !direct,
        !direct,
        !direct,
        !direct,
      ]);
    }
  }
  console.log(`Entrypoint semantics passed on Bun ${Bun.version}: JS, TS, ESM and CommonJS.`);
} finally {
  await rm(directory, { recursive: true, force: true });
}
