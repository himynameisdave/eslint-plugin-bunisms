import 'dotenv/config';

import { exec, spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
fileURLToPath(import.meta.url);
createHash('sha256').update('hello').digest('hex');
exec('echo hello');
await readFile('input.txt', 'utf8');
await writeFile('output.txt', 'hello');
spawn('echo', ['hello']);
spawnSync('echo', ['hello']);

import { dirname } from 'node:path';
const __dirname = dirname(fileURLToPath(import.meta.url));
if (import.meta.path === Bun.main) console.log('entrypoint');
