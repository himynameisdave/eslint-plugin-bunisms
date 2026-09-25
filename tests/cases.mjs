// Shared by ESLint RuleTester (Bun and Node) and the real Oxlint CLI.
export const cases = {};
for (const [name, methods, modules] of [
  ["prefer-bun-file", ["readFile"], ["fs", "node:fs", "fs/promises", "node:fs/promises"]],
  ["prefer-bun-write", ["writeFile"], ["fs", "node:fs", "fs/promises", "node:fs/promises"]],
  ["prefer-bun-spawn", ["spawn", "spawnSync"], ["child_process", "node:child_process"]],
]) {
  const valid = [];
  const invalid = [];
  for (const method of methods) {
    for (const source of modules) {
      for (const code of [
        `import { ${method} } from '${source}'; ${method}('file');`,
        `import { ${method} as run } from '${source}'; run('file');`,
        `import * as api from '${source}'; api.${method}('file');`,
        `import api from '${source}'; api['${method}']('file');`,
        `const api = require('${source}'); api.${method}('file');`,
        `const { ${method}: run } = require('${source}'); run('file');`,
        `const { ${method} } = require('${source}'); ${method}('file');`,
        `require('${source}').${method}('file');`,
        `import * as api from '${source}'; api?.${method}?.('file');`,
      ]) invalid.push({ code, count: 1 });
      invalid.push({ code: `import { ${method} as run } from '${source}'; run('a'); run('b');`, count: 2 });
      valid.push(
        `import { ${method} } from '${source}'; function f(${method}) { ${method}(); }`,
        `import * as api from '${source}'; function f(api) { api.${method}(); }`,
        `function f(require) { const api = require('${source}'); api.${method}(); }`,
        `const { ${method} } = require('${source}'); function f(${method}) { ${method}(); }`,
        `let api = require('${source}'); api = custom; api.${method}();`,
        `const api = require('${source}'); api.${method} = custom; api.${method}();`,
        `import api from '${source}'; delete api.${method}; api.${method}();`,
        `import api from '${source}'; api[method]();`,
        `import { ${method} } from '${source}'; use(${method});`,
      );
    }
    valid.push(`function ${method}() {} ${method}();`, `import { ${method} } from 'unrelated'; ${method}();`);
    invalid.push({ code: `import { ${method} as run } from '${modules[0]}'; const path: string = 'a'; run(path!);`, count: 1, ts: true });
    valid.push({ code: `import { ${method} } from '${modules[0]}'; function f(${method}: () => void): void { ${method}(); }`, ts: true });
    valid.push({ code: `import type { ${method} } from '${modules[0]}'; ${method}();`, ts: true });
    if (modules.includes("fs")) {
      invalid.push({ code: `import { promises as fs } from 'node:fs'; fs.${method}('a');`, count: 1 });
      invalid.push({ code: `import fs from 'fs'; fs.promises.${method}('a');`, count: 1 });
      valid.push(`import fs from 'fs'; fs.${method}Sync('a'); fs.mkdir('a'); fs.appendFile('a', 'b');`);
    } else valid.push("import cp from 'node:child_process'; cp.exec('ls'); cp.execSync('ls'); cp.fork('a');");
  }
  cases[name] = { valid: [...new Set(valid)].map((value) => typeof value === "string" ? { code: value } : value), invalid };
}
