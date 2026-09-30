import * as childProcess from 'node:child_process';
import { readFile as read, writeFile as write } from 'node:fs/promises';
import { fileURLToPath as toPath } from 'node:url';
toPath(import.meta.url);
const path: string = 'input.txt';
await read(path, 'utf8');
await write(path, 'hello');
childProcess.spawn('echo', ['hello']);
childProcess.spawnSync('echo', ['hello']);
function shadow(read: () => void): void {
  read();
}

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
if (import.meta.path === Bun.main) console.log('entrypoint');
