import { spawn, spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
await readFile('input.txt', 'utf8');
await writeFile('output.txt', 'hello');
spawn('echo', ['hello']);
spawnSync('echo', ['hello']);
