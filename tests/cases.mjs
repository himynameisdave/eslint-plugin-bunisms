// Shared by ESLint RuleTester (Bun and Node) and the real Oxlint CLI.
export const cases = {};
cases['no-dotenv'] = {
  valid: [
    "import dotenv from 'dotenv'; dotenv.config({ path: getCustomEnvironmentPath() });",
    "import dotenv from 'dotenv'; dotenv.config({ override: true });",
    "import dotenv from 'dotenv'; dotenv.config(options);",
    "import { config } from 'unrelated'; config();",
    'function config() {} config();',
    'function f(dotenv) { dotenv.config(); }',
    "import dotenv from 'dotenv'; function f(dotenv) { dotenv.config(); }",
    "import dotenv from 'dotenv'; dotenv.config = custom; dotenv.config();",
    { code: "import type dotenv from 'dotenv'; dotenv.config();", ts: true },
    { code: "import type { config } from 'dotenv'; config();", ts: true },
    "function f(require) { require('dotenv/config'); }",
    "function f(require) { const dotenv = require('dotenv'); dotenv.config(); }",
    "import dotenv from 'dotenv'; dotenv.config({ quiet: true, path: '.env.custom' });",
    "import dotenv from 'dotenv'; dotenv.config({ ...options, quiet: true });",
    "import dotenv from 'dotenv'; dotenv.config({ [key]: true });",
    "import dotenv from 'dotenv'; const result = dotenv.config(); if (result.error) throw result.error;",
    "import { config } from 'dotenv'; const { parsed } = config({ quiet: true });",
    "import dotenv from 'dotenv'; dotenv.parse('A=1');",
    'import(source);',
  ].map((item) => (typeof item === 'string' ? { code: item } : item)),
  invalid: [
    { code: "import 'dotenv/config';", count: 1 },
    { code: "import dotenv from 'dotenv'; dotenv.config();", count: 1 },
    { code: "import * as dotenv from 'dotenv'; dotenv.config();", count: 1 },
    { code: "import { config as loadEnv } from 'dotenv'; loadEnv();", count: 1 },
    { code: "import dotenv from 'dotenv'; dotenv['config']();", count: 1 },
    { code: "const dotenv = require('dotenv'); dotenv.config();", count: 1 },
    { code: "const { config: loadEnv } = require('dotenv'); loadEnv();", count: 1 },
    { code: "require('dotenv').config();", count: 1 },
    { code: "require('dotenv/config');", count: 1 },
    { code: "import 'dotenv/config'; import 'dotenv/config';", count: 2 },
    { code: "import { config } from 'dotenv'; config();", count: 1, ts: true },
    { code: "import 'dotenv/config.js';", count: 1 },
    { code: "require('dotenv/config.js');", count: 1 },
    { code: "await import('dotenv/config');", count: 1 },
    { code: "import { configDotenv } from 'dotenv'; configDotenv();", count: 1 },
    { code: "import dotenv from 'dotenv'; dotenv.configDotenv({ quiet: true });", count: 1 },
    { code: "import dotenv from 'dotenv'; dotenv.config({ quiet: true });", count: 1 },
    { code: "require('dotenv').config({ 'debug': false, quiet: true });", count: 1 },
    { code: "import dotenv from 'dotenv'; dotenv.config({});", count: 1 },
  ],
};
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

const dirImports = "import { dirname } from 'node:path'; import { fileURLToPath } from 'node:url';";
const dirExpression = 'dirname(fileURLToPath(import.meta.url))';
const dirValid = [
  `${dirImports} dirname(userSuppliedPath);`,
  `${dirImports} dirname(fileURLToPath(other.url));`,
  `${dirImports} dirname(fileURLToPath(import.meta.url, { windows: true }));`,
  `${dirImports} dirname(fileURLToPath(import.meta.url), extra());`,
  `${dirImports} dirname(fileURLToPath(new URL('.', import.meta.url)));`,
  `${dirImports} dirname?.(fileURLToPath(import.meta.url));`,
  `${dirImports} dirname(fileURLToPath?.(import.meta.url));`,
  `${dirImports} dirname(fileURLToPath(import.meta['url']));`,
  `${dirImports} function f(dirname) { ${dirExpression}; }`,
  `${dirImports} function f(fileURLToPath) { ${dirExpression}; }`,
  `function dirname(x) { return x; } function fileURLToPath(x) { return x; } ${dirExpression};`,
  `import { dirname } from 'unrelated'; import { fileURLToPath } from 'node:url'; ${dirExpression};`,
  `import { dirname } from 'node:path'; import { fileURLToPath } from 'unrelated'; ${dirExpression};`,
  `import path from 'node:path'; import url from 'node:url'; path.dirname = custom; path.dirname(url.fileURLToPath(import.meta.url));`,
  `import path from 'node:path'; import url from 'node:url'; url.fileURLToPath = custom; path.dirname(url.fileURLToPath(import.meta.url));`,
  `function f(require) { const { dirname } = require('path'); const { fileURLToPath } = require('url'); ${dirExpression}; }`,
  `${dirImports} const filename = fileURLToPath(import.meta.url); dirname(filename);`,
  `import path from 'path'; import url from 'url'; path.posix.dirname(url.fileURLToPath(import.meta.url));`,
  `import path from 'path'; import url from 'url'; path.win32.dirname(url.fileURLToPath(import.meta.url));`,
  {
    code: `import type { dirname } from 'path'; import { fileURLToPath } from 'url'; ${dirExpression};`,
    ts: true,
  },
  {
    code: `import { dirname } from 'path'; import type { fileURLToPath } from 'url'; ${dirExpression};`,
    ts: true,
  },
];
const dirInvalid = [];
for (const prefix of ['', 'node:']) {
  for (const [imports, expression] of [
    [
      `import { dirname } from '${prefix}path'; import { fileURLToPath } from '${prefix}url';`,
      dirExpression,
    ],
    [
      `import { dirname as d } from '${prefix}path'; import { fileURLToPath as f } from '${prefix}url';`,
      'd(f(import.meta.url))',
    ],
    [
      `import * as p from '${prefix}path'; import * as u from '${prefix}url';`,
      'p.dirname(u.fileURLToPath(import.meta.url))',
    ],
    [
      `import p from '${prefix}path'; import u from '${prefix}url';`,
      "p['dirname'](u['fileURLToPath'](import.meta.url))",
    ],
    [
      `const { dirname } = require('${prefix}path'); const { fileURLToPath } = require('${prefix}url');`,
      dirExpression,
    ],
    [
      `const p = require('${prefix}path'); const u = require('${prefix}url');`,
      'p.dirname(u.fileURLToPath(import.meta.url))',
    ],
    ['', `require('${prefix}path').dirname(require('${prefix}url').fileURLToPath(import.meta.url))`],
  ]) {
    for (const ts of [false, true]) {
      const code = `${imports}\nconst __dirname${ts ? ': string' : ''} = ${expression};\nlet directory; directory = ${expression};`;
      const lines = code.split('\n');
      dirInvalid.push({
        code,
        ts,
        count: 2,
        errors: [2, 3].map((line) => ({
          message: 'Prefer import.meta.dir for the current module directory.',
          line,
          column: lines[line - 1].indexOf(expression) + 1,
          endLine: line,
          endColumn: lines[line - 1].indexOf(expression) + expression.length + 1,
        })),
      });
    }
  }
}
cases['prefer-import-meta-dir'] = {
  valid: dirValid.flatMap((item) =>
    typeof item === 'string' ? [{ code: item }, { code: item, ts: true }] : [item],
  ),
  invalid: dirInvalid,
};

const entrypointValid = [
  'import.meta.main;',
  'function f(require, module) { return require.main === module; }',
  'function f(module) { return require.main === module; }',
  'function f(require) { return module === require.main; }',
  'function f(Bun) { return import.meta.path === Bun.main; }',
  'const Bun = { main: "x" }; import.meta.path === Bun.main;',
  'import Bun from "bun"; import.meta.path === Bun.main;',
  'import * as Bun from "bun"; import.meta.path === Bun.main;',
  'import { main as entry } from "bun"; import.meta.path === entry;',
  'import { createRequire } from "node:module"; const require = createRequire(import.meta.url); require.main === module;',
  'import module from "module"; require.main === module;',
  'const req = require; req.main === module;',
  'const entry = Bun.main; import.meta.path === entry;',
  'function require() {} require.main === module;',
  'function module() {} require.main === module;',
  'require.main === other; module === unrelated.main;',
  'import.meta.url === Bun.main; import.meta.path === Other.main;',
  'require[key] === module; import.meta.path === Bun[key];',
  'require?.main === module; import.meta.path === Bun?.main;',
  'require.main > module; import.meta.path + Bun.main;',
  'require.main; Bun.main; module;',
  '{ const module = {}; require.main === module; }',
  'import.meta.path === Bun.main; var Bun;',
];
const entrypointInvalid = [];
for (const ts of [false, true]) {
  for (const operator of ['===', '!==', '==', '!=']) {
    for (const [left, right] of [
      ['require.main', 'module'],
      ['import.meta.path', 'Bun.main'],
      ["require['main']", 'module'],
      ["import.meta['path']", "Bun['main']"],
    ]) {
      for (const code of [`${left} ${operator} ${right};`, `${right} ${operator} ${left};`]) {
        entrypointInvalid.push({
          code,
          ts,
          count: 1,
          errors: [
            {
              messageId: 'preferBun',
              line: 1,
              column: 1,
              endLine: 1,
              endColumn: code.length,
              suggestions: [],
            },
          ],
        });
      }
    }
  }
}
entrypointInvalid.push(
  {
    code: 'require.main === module;\nimport.meta.path !== Bun.main;',
    count: 2,
    errors: [
      { messageId: 'preferBun', line: 1, column: 1, endLine: 1, endColumn: 24 },
      { messageId: 'preferBun', line: 2, column: 1, endLine: 2, endColumn: 30 },
    ],
  },
  { code: 'require.main === module;', sourceType: 'commonjs', count: 1 },
);
cases['prefer-import-meta-main'] = {
  valid: entrypointValid.flatMap((code) => [{ code }, { code, ts: true }]),
  invalid: entrypointInvalid,
};
