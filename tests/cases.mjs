// Shared by ESLint RuleTester (Bun and Node) and the real Oxlint CLI.
export const cases = {};
for (const [name, methods, modules] of [
  ['prefer-bun-file', ['readFile'], ['fs', 'node:fs', 'fs/promises', 'node:fs/promises']],
  ['prefer-bun-write', ['writeFile'], ['fs', 'node:fs', 'fs/promises', 'node:fs/promises']],
  ['prefer-bun-spawn', ['spawn', 'spawnSync'], ['child_process', 'node:child_process']],
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
      ]) {
        invalid.push({ code, count: 1 });
      }
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
    valid.push(
      `function ${method}() {} ${method}();`,
      `import { ${method} } from 'unrelated'; ${method}();`,
    );
    invalid.push({
      code: `import { ${method} as run } from '${modules[0]}'; const path: string = 'a'; run(path!);`,
      count: 1,
      ts: true,
    });
    valid.push(
      {
        code: `import { ${method} } from '${modules[0]}'; function f(${method}: () => void): void { ${method}(); }`,
        ts: true,
      },
      { code: `import type { ${method} } from '${modules[0]}'; ${method}();`, ts: true },
    );
    if (modules.includes('fs')) {
      invalid.push(
        { code: `import { promises as fs } from 'node:fs'; fs.${method}('a');`, count: 1 },
        { code: `import fs from 'fs'; fs.promises.${method}('a');`, count: 1 },
      );
      valid.push(`import fs from 'fs'; fs.${method}Sync('a'); fs.mkdir('a'); fs.appendFile('a', 'b');`);
    } else {
      valid.push("import cp from 'node:child_process'; cp.exec('ls'); cp.execSync('ls'); cp.fork('a');");
    }
  }
  cases[name] = {
    valid: [...new Set(valid)].map((value) => (typeof value === 'string' ? { code: value } : value)),
    invalid,
  };
}
const importMetaPath = {
  valid: [
    'fileURLToPath(otherUrl);',
    "import { fileURLToPath } from 'unrelated'; fileURLToPath(import.meta.url);",
    'function fileURLToPath(value) {} fileURLToPath(import.meta.url);',
    "import { fileURLToPath } from 'node:url'; function f(fileURLToPath) { fileURLToPath(import.meta.url); }",
    "import { fileURLToPath as toPath } from 'node:url'; function f(toPath) { toPath(import.meta.url); }",
    "import { fileURLToPath } from 'node:url'; const shadow = { fileURLToPath(value) {} }; shadow.fileURLToPath(import.meta.url);",
    "import { fileURLToPath } from 'node:url'; fileURLToPath(import.meta['url']);",
    "import { fileURLToPath } from 'node:url'; fileURLToPath(other.meta.url);",
    "import { fileURLToPath } from 'node:url'; fileURLToPath(import.meta.url, { windows: true });",
    { code: "import type { fileURLToPath } from 'node:url'; fileURLToPath(import.meta.url);", ts: true },
    {
      code: "import { fileURLToPath } from 'node:url'; function f(fileURLToPath: (url: string) => string) { fileURLToPath(import.meta.url); }",
      ts: true,
    },
  ],
  invalid: [
    "import { fileURLToPath } from 'url'; fileURLToPath(import.meta.url);",
    "import { fileURLToPath } from 'node:url'; fileURLToPath(import.meta.url);",
    "import { fileURLToPath as toPath } from 'node:url'; toPath(import.meta.url);",
    "import * as url from 'node:url'; url.fileURLToPath(import.meta.url);",
    "import url from 'node:url'; url.fileURLToPath(import.meta.url);",
    "const url = require('node:url'); url.fileURLToPath(import.meta.url);",
    "const { fileURLToPath } = require('url'); fileURLToPath(import.meta.url);",
    "require('node:url').fileURLToPath(import.meta.url);",
    "import { fileURLToPath } from 'node:url'; fileURLToPath(import.meta.url); fileURLToPath(import.meta.url);",
    { code: "import { fileURLToPath } from 'node:url'; fileURLToPath(import.meta.url);", ts: true },
  ].map((entry) => ({
    code: typeof entry === 'string' ? entry : entry.code,
    ts: typeof entry === 'string' ? undefined : entry.ts,
    count:
      (typeof entry === 'string' ? entry : entry.code).match(
        /(?:require\('[^']+'\)\.)?[\w$.]+\(import\.meta\.url\)/gu,
      )?.length ?? 1,
  })),
};
importMetaPath.valid = importMetaPath.valid.map((entry) =>
  typeof entry === 'string' ? { code: entry } : entry,
);
cases['prefer-import-meta-path'] = importMetaPath;
