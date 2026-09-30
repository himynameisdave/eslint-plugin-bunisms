import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'bunisms-resolve-'));
const directory = await realpath(temporaryDirectory);
try {
  const packageDirectory = join(directory, 'node_modules/conditional');
  const alternateDirectory = join(directory, 'alternate/node_modules/only-there');
  await Promise.all([
    mkdir(packageDirectory, { recursive: true }),
    mkdir(alternateDirectory, { recursive: true }),
  ]);
  await Promise.all([
    writeFile(
      join(packageDirectory, 'package.json'),
      JSON.stringify({
        name: 'conditional',
        exports: { import: './esm.js', require: './cjs.cjs' },
      }),
    ),
    writeFile(join(packageDirectory, 'esm.js'), 'export {};'),
    writeFile(join(packageDirectory, 'cjs.cjs'), 'module.exports = {};'),
    writeFile(join(alternateDirectory, 'index.js'), 'module.exports = {};'),
    writeFile(join(directory, 'space # percent% unicode-é.js'), 'export {};'),
  ]);
  const source = `console.log(JSON.stringify({
    path: require.resolve('./space # percent% unicode-é.js'),
    url: import.meta.resolve('./space # percent% unicode-é.js'),
    requireCondition: require.resolve('conditional'),
    importCondition: import.meta.resolve('conditional'),
    builtinPath: require.resolve('fs'),
    builtinUrl: import.meta.resolve('fs'),
    lookup: require.resolve('only-there', { paths: [${JSON.stringify(join(directory, 'alternate'))}] }),
  }));`;
  const files = ['js', 'ts', 'mjs', 'cjs'].map((extension) => join(directory, `entry.${extension}`));
  await Promise.all(files.map((file) => writeFile(file, source)));
  for (const file of files) {
    const result = Bun.spawnSync([process.execPath, file]);
    assert.equal(result.exitCode, 0, result.stderr.toString());
    const actual = JSON.parse(result.stdout.toString());
    assert.deepEqual(actual, {
      path: join(directory, 'space # percent% unicode-é.js'),
      // Bun 1.4.0–1.4.2 leaves # and % unescaped.
      // Revisit the rule's conservative exclusion when this runtime behavior changes.
      url: `${pathToFileURL(directory).href}/space%20#%20percent%%20unicode-%C3%A9.js`,
      requireCondition: join(packageDirectory, 'cjs.cjs'),
      importCondition: pathToFileURL(join(packageDirectory, 'esm.js')).href,
      builtinPath: 'fs',
      builtinUrl: 'node:fs',
      lookup: join(alternateDirectory, 'index.js'),
    });
  }
  console.log(
    `Resolution semantics passed on Bun ${Bun.version}: paths, URLs, conditions, lookup options and CommonJS.`,
  );
} finally {
  await rm(directory, { recursive: true, force: true });
}
