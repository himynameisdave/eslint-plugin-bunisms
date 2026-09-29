import { test, expect } from 'bun:test';
import { mkdtemp, mkdir, writeFile, symlink, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('module directory matches Node boilerplate for encoded paths and symlinks', async () => {
  const root = await mkdtemp(join(tmpdir(), 'bunisms-dir-'));
  try {
    const directory = join(root, 'space # percent% unicode-é');
    await mkdir(directory);
    const source = `import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
if (dirname(fileURLToPath(import.meta.url)) !== import.meta.dir) throw new Error('directory mismatch');
console.log(import.meta.dir);`;
    const expectedDirectory = await realpath(directory);
    const file = join(directory, 'module.mjs');
    await writeFile(file, source);
    const link = join(root, 'linked.mjs');
    await symlink(file, link);
    for (const entry of [file, link]) {
      const result = Bun.spawnSync([process.execPath, entry]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout.toString().trim()).toBe(expectedDirectory);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
