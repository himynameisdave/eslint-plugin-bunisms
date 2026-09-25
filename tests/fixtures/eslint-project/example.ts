import { readFile as read, writeFile as write } from "node:fs/promises";
import * as childProcess from "node:child_process";
const path: string = "input.txt";
await read(path, "utf8");
await write(path, "hello");
childProcess.spawn("echo", ["hello"]);
childProcess.spawnSync("echo", ["hello"]);
function shadow(read: () => void): void { read(); }
