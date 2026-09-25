import assert from 'node:assert/strict';
import { cp, mkdtemp, writeFile, readFile, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
const directory = await mkdtemp(join(tmpdir(), 'bunisms-package-'));
const root = process.cwd();
function run(args: string[], cwd = directory): string {
  const result = Bun.spawnSync(args, { cwd });
  assert.equal(result.exitCode, 0, result.stderr.toString() + result.stdout.toString());
  return result.stdout.toString();
}
try {
  const [pack] = JSON.parse(
    run(['npm', 'pack', '--ignore-scripts', '--json', '--pack-destination', directory], root),
  );
  const files = pack.files.map((file: { path: string }) => file.path);
  assert.ok(
    files.includes('dist/index.js') && files.includes('dist/index.d.ts') && files.includes('LICENSE'),
  );
  assert.ok(!files.some((file: string) => /^(?:src|tests|scripts)\//u.test(file)));
  await writeFile(join(directory, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
  run([
    'npm',
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--no-package-lock',
    join(directory, pack.filename),
  ]);
  await assert.rejects(
    access(join(directory, 'node_modules/eslint')),
    'Optional ESLint peer should not install itself',
  );
  run([
    'node',
    '--input-type=module',
    '-e',
    "import plugin from 'eslint-plugin-bunisms'; if(Object.keys(plugin.rules).length !== 3) process.exit(1)",
  ]);
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
  // Install real consumers only after proving the package works without ESLint.
  run([
    'npm',
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--no-package-lock',
    `eslint@${process.env.ESLINT_MAJOR || '9'}`,
    `@typescript-eslint/parser@${pkg.devDependencies['@typescript-eslint/parser']}`,
    `oxlint@${pkg.devDependencies.oxlint}`,
    `typescript@${pkg.devDependencies.typescript}`,
  ]);
  await Promise.all(
    ['eslint-project', 'oxlint-project'].map((fixture) =>
      cp(resolve('tests/fixtures', fixture), join(directory, fixture), { recursive: true }),
    ),
  );
  const eslintOutput = JSON.parse(
    run(
      ['node', '../node_modules/eslint/bin/eslint.js', 'example.js', 'example.ts', '--format', 'json'],
      join(directory, 'eslint-project'),
    ),
  );
  for (const file of eslintOutput) {
    assert.equal(file.errorCount, 0);
    assert.deepEqual(file.messages.map((message: { ruleId: string }) => message.ruleId).toSorted(), [
      'bun/prefer-bun-file',
      'bun/prefer-bun-spawn',
      'bun/prefer-bun-spawn',
      'bun/prefer-bun-write',
    ]);
  }
  assert.equal(eslintOutput.length, 2);
  const oxlintOutput = JSON.parse(
    run(
      ['node', '../node_modules/oxlint/bin/oxlint', '--format', 'json', 'example.js', 'example.ts'],
      join(directory, 'oxlint-project'),
    ),
  );
  assert.equal(oxlintOutput.diagnostics.length, 8);
  for (const diagnostic of oxlintOutput.diagnostics) {
    assert.match(diagnostic.code, /^bun\(prefer-bun-(?:file|write|spawn)\)$/u);
  }
  await writeFile(
    join(directory, 'consumer.mts'),
    `import bun from "eslint-plugin-bunisms";
import type { Linter } from "eslint";
const config: Linter.Config = bun.configs.recommended;
export default [config];
`,
  );
  run([
    'node',
    'node_modules/typescript/bin/tsc',
    '--noEmit',
    '--strict',
    '--skipLibCheck',
    '--module',
    'NodeNext',
    '--moduleResolution',
    'NodeNext',
    '--target',
    'ES2022',
    'consumer.mts',
  ]);
  // Keep the reviewed tarball in the workspace for manual testing.
  await cp(join(directory, pack.filename), join(root, pack.filename));
  console.log(
    `Clean package passed: ${pack.filename}; Node import, optional peer, ESLint JS/TS, Oxlint JS/TS.`,
  );
} finally {
  await rm(directory, { recursive: true, force: true });
}
