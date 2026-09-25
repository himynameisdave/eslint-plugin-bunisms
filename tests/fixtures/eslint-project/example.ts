import * as childProcess from 'node:child_process';
import { readFile as read, writeFile as write } from 'node:fs/promises';
const path: string = 'input.txt';
await read(path, 'utf8');
await write(path, 'hello');
childProcess.spawn('echo', ['hello']);
childProcess.spawnSync('echo', ['hello']);
function shadow(read: () => void): void {
  read();
}
