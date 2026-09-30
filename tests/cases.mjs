// Shared by ESLint RuleTester (Bun and Node) and the real Oxlint CLI.
export const cases = {};
const items = (entries) => entries.map((entry) => (typeof entry === 'string' ? { code: entry } : entry));
const withCount = (entries, pattern) =>
  items(entries).map((item) => Object.assign(item, { count: item.code.match(pattern)?.length ?? 1 }));

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
cases['prefer-bun-crypto-hasher'] = {
  valid: items([
    "import { createHmac } from 'node:crypto'; createHmac('sha256', key).update(data).digest('hex');",
    "import { createHash } from 'node:crypto'; createHash(algorithm).update(data).digest('hex');",
    "import { createHash } from 'node:crypto'; createHash('shake128').update(data).digest('hex');",
    "import { createHash } from 'node:crypto'; createHash('md4').update(data).digest('hex');",
    "import { createHash } from 'node:crypto'; createHash('blake2b256').update(data).digest('hex');",
    "import { createHash } from 'node:crypto'; createHash('sha256').update(data, 'utf-16le').digest('hex');",
    "import { createHash } from 'node:crypto'; createHash('sha256', { outputLength: 16 }).update(data).digest('hex');",
    "import { createHash } from 'node:crypto'; createHash('sha256').update(data).digest('latin1');",
    "import { createHash } from 'node:crypto'; createHash('sha256').update(data, encoding).digest('hex');",
    "import { createHash } from 'node:crypto'; const hash = createHash('sha256'); hash.update(data); hash.digest('hex');",
    "import { createHash } from 'unrelated'; createHash('sha256').update(data).digest('hex');",
    "function createHash() { return { update() { return this; }, digest() {} }; } createHash('sha256').update(data).digest('hex');",
    "const crypto = { createHash() { return { update() { return this; }, digest() {} }; } }; crypto.createHash('sha256').update(data).digest('hex');",
    "import { createHash } from 'node:crypto'; function f(createHash) { createHash('sha256').update(data).digest('hex'); }",
    "import * as crypto from 'node:crypto'; function f(crypto) { crypto.createHash('sha256').update(data).digest('hex'); }",
    "function f(require) { const { createHash } = require('node:crypto'); createHash('sha256').update(data).digest('hex'); }",
    "import * as crypto from 'node:crypto'; crypto.createHash('sha256').update(data).digest('hex'); crypto.createHash = custom;",
    {
      code: "import type { createHash } from 'node:crypto'; createHash('sha256').update(data).digest('hex');",
      ts: true,
    },
  ]),
  invalid: withCount(
    [
      {
        code: "import { createHash } from 'node:crypto'; createHash('sha256').update(data).digest('hex');",
        errors: [
          {
            messageId: 'preferBunCryptoHasher',
            line: 1,
            column: 43,
            endLine: 1,
            endColumn: 90,
            suggestions: [],
          },
        ],
      },
      "import { createHash as hash } from 'crypto'; hash('sha512').update(data).digest('base64');",
      "import * as crypto from 'node:crypto'; crypto['createHash']('sha256').update(data).update(other).digest('base64url');",
      "import crypto from 'crypto'; crypto.createHash('sha3-256').update(data).digest('hex');",
      "import { createHash } from 'node:crypto'; createHash('sha256').update(data).digest();",
      "import { createHash } from 'node:crypto'; createHash('md5').update(text, 'utf-8').digest('hex');",
      "import { createHash } from 'node:crypto'; createHash('sha256')?.update(data).digest('hex');",
      "import { createHash } from 'node:crypto'; createHash('sha256').update?.(data).digest('hex');",
      "const { createHash } = require('node:crypto'); createHash('sha256').update(data).digest('hex');",
      {
        code: "const { createHash } = require('node:crypto'); createHash('sha256').update(data).digest('hex');",
        sourceType: 'commonjs',
      },
      "const crypto = require('crypto'); crypto.createHash('sha256').update(data).digest('hex');",
      "require('node:crypto').createHash('sha256').update(data).digest('hex');",
      "import { createHash as hash } from 'node:crypto'; hash('sha256').update(first).update(second).digest('hex'); hash('md5').update(data).digest('hex');",
      {
        code: "import { createHash } from 'node:crypto'; createHash('sha256').update(data).digest('hex');",
        ts: true,
      },
    ],
    /\.digest\((?:'(?:hex|base64|base64url)')?\)/gu,
  ),
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

const shell = { valid: [], invalid: [] };
for (const source of ['child_process', 'node:child_process']) {
  for (const method of ['exec', 'execSync']) {
    for (const code of [
      `import { ${method} } from '${source}'; ${method}('echo hello');`,
      `import { ${method} as run } from '${source}'; run('echo hello');`,
      `import * as cp from '${source}'; cp.${method}('echo hello');`,
      `import cp from '${source}'; cp['${method}']('echo hello');`,
      `const cp = require('${source}'); cp.${method}('echo hello');`,
      `const { ${method}: run } = require('${source}'); run('echo hello');`,
      `const { ${method} } = require('${source}'); ${method}('echo hello');`,
      `require('${source}').${method}('echo hello');`,
    ]) {
      const directImport = code.startsWith(`import { ${method} } from`);
      const start = directImport ? code.indexOf(`${method}(`) : -1;
      const callee = directImport ? method : '';
      shell.invalid.push({
        code,
        count: 1,
        messageId: 'preferBunShell',
        ...(directImport
          ? {
              errors: [
                {
                  messageId: 'preferBunShell',
                  line: 1,
                  column: start + 1,
                  endLine: 1,
                  endColumn: start + callee.length + 1,
                },
              ],
            }
          : {}),
      });
    }
  }
}
shell.invalid.push(
  {
    code: "import { exec } from 'node:child_process'; exec('a'); exec('b');",
    count: 2,
    messageId: 'preferBunShell',
    errors: [
      { messageId: 'preferBunShell', line: 1, column: 44, endLine: 1, endColumn: 48 },
      { messageId: 'preferBunShell', line: 1, column: 55, endLine: 1, endColumn: 59 },
    ],
  },
  {
    code: "import { exec as run } from 'node:child_process'; const path: string = 'a'; run(path!);",
    count: 1,
    messageId: 'preferBunShell',
    ts: true,
    errors: [{ messageId: 'preferBunShell', line: 1, column: 77, endLine: 1, endColumn: 80 }],
  },
  {
    code: "import { execSync } from 'node:child_process'; execSync('a');",
    count: 1,
    errors: [{ message: 'Consider Bun Shell or Bun.spawnSync() for shell-oriented process execution.' }],
  },
);
shell.valid.push(
  "import { spawn } from 'node:child_process'; spawn('echo', ['hello']);",
  "import { execFile, execFileSync, fork } from 'node:child_process'; execFile('echo'); execFileSync('echo'); fork('a');",
  "function exec() {} exec('echo hello');",
  "import { exec } from 'unrelated'; exec('echo hello');",
  "import { exec } from 'node:child_process'; function f(exec) { exec('echo hello'); }",
  "import { exec as run } from 'node:child_process'; function f(run) { run('echo hello'); }",
  "import * as cp from 'node:child_process'; function f(cp) { cp.exec('echo hello'); }",
  "function f(require) { const cp = require('node:child_process'); cp.exec('echo hello'); }",
  "const cp = require('node:child_process'); cp = custom; cp.exec('echo hello');",
  "const cp = require('node:child_process'); cp.exec = custom; cp.exec('echo hello');",
  "import cp from 'node:child_process'; delete cp.exec; cp.exec('echo hello');",
  "import { exec } from 'node:child_process'; exec;",
  { code: "import type { exec } from 'node:child_process'; exec('echo hello');", ts: true },
  { code: "import { exec } from 'node:child_process'; function f(exec: () => void) { exec(); }", ts: true },
);
shell.valid = shell.valid.map((item) => (typeof item === 'string' ? { code: item } : item));
cases['prefer-bun-shell'] = shell;

cases['prefer-import-meta-path'] = {
  valid: items([
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
  ]),
  invalid: withCount(
    [
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
    ],
    /(?:require\('[^']+'\)\.)?[\w$.]+\(import\.meta\.url\)/gu,
  ),
};

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

const resolveValid = [
  { code: "export = require.resolve('some-package');", ts: true },
  "require.resolve('./hash#file.js');",
  "require.resolve('./percent%file.js');",
  "require.resolve('./query?file.js');",
  "require.resolve('#internal');",
  "import.meta.resolve('some-package');",
  "function resolveWith(require) { return require.resolve('some-package'); }",
  "const require = custom; require.resolve('some-package');",
  "function require() {} require.resolve('some-package');",
  "{ const require = custom; require.resolve('some-package'); }",
  "try {} catch (require) { require.resolve('some-package'); }",
  "import require from 'unrelated'; require.resolve('some-package');",
  "import * as require from 'unrelated'; require.resolve('some-package');",
  "import { resolver as require } from 'unrelated'; require.resolve('some-package');",
  "const resolver = require; resolver.resolve('some-package');",
  "const { resolve } = require; resolve('some-package');",
  "require.resolve('some-package', { paths: ['/elsewhere'] });",
  "require.resolve('some-package', undefined);",
  'require.resolve(...args);',
  'require.resolve(name);',
  'require.resolve(`some-package`);',
  "require.resolve('');",
  'require.resolve();',
  'require.resolve(42);',
  "require?.resolve('some-package');",
  "require.resolve?.('some-package');",
  "require[method]('some-package');",
  "require.resolve.paths('some-package');",
  "require.resolve.call(require, 'some-package');",
  'use(require.resolve);',
  "other.require.resolve('some-package');",
  "require = custom; require.resolve('some-package');",
  "require.resolve('some-package'); require.resolve = custom;",
  "delete require['resolve']; require.resolve('some-package');",
  "require.resolve++; require.resolve('some-package');",
  "({ require } = custom); require.resolve('some-package');",
  "[require] = custom; require.resolve('some-package');",
  "for (require of values) {} require.resolve('some-package');",
  "module.exports = require.resolve('some-package');",
  "exports.path = require.resolve('some-package');",
  "require.resolve('some-package'); module['exports'] = {};",
  "if (require.main === module) require.resolve('some-package');",
  "if (typeof exports === 'object') {} require.resolve('some-package');",
  "Object.assign(module, {}); require.resolve('some-package');",
  { code: "(require as any).resolve = custom; require.resolve('some-package');", ts: true },
  { code: "require!.resolve = custom; require.resolve('some-package');", ts: true },
  { code: "(<any>require).resolve = custom; require.resolve('some-package');", ts: true },
  { code: "(require satisfies object).resolve = custom; require.resolve('some-package');", ts: true },
  { code: "import fs = require('fs'); require.resolve('some-package');", ts: true },
  { code: "require.resolve('some-package');", sourceType: 'commonjs' },
  { code: "require.resolve('some-package');", filename: 'example.cjs' },
  { code: "require.resolve('some-package');", filename: 'example.cts', ts: true },
];
for (const source of ['module', 'node:module']) {
  resolveValid.push(
    `import { createRequire } from '${source}'; const require = createRequire(import.meta.url); require.resolve('some-package');`,
    `import { createRequire as makeRequire } from '${source}'; const req = makeRequire('/elsewhere/file.js'); req.resolve('some-package');`,
    `import mod from '${source}'; const require = mod.createRequire(import.meta.url); require.resolve('some-package');`,
    `import * as mod from '${source}'; const require = mod.createRequire(import.meta.url); require.resolve('some-package');`,
    `const { createRequire } = require('${source}'); const req = createRequire('/elsewhere/file.js'); req.resolve('some-package');`,
  );
}
const resolveInvalid = [
  "const path = require.resolve('some-package');",
  "require['resolve']('./file.js');",
  'require["resolve"]("node:fs");',
  "require.resolve('fs');",
  "require.resolve('/absolute/file.js');",
  "require.resolve('a');\nrequire.resolve('b');",
  "function find() { return require.resolve('./file.js'); }",
  "function f(require) { require.resolve('ignored'); }\nrequire.resolve('reported');",
  "function f(require) { require.resolve = custom; }\nrequire.resolve('reported');",
  "function f(module, exports) { module.exports = exports.foo; }\nrequire.resolve('reported');",
  { code: "require.resolve('some-package');", sourceType: 'script' },
  { code: "import A = B.C; require.resolve('some-package');", ts: true },
];
cases['prefer-import-meta-resolve'] = {
  valid: resolveValid.flatMap((item) => {
    if (typeof item !== 'string') {
      return [item];
    }
    return [{ code: item }, { code: item, ts: true }];
  }),
  invalid: resolveInvalid.flatMap((entry) => {
    const item = typeof entry === 'string' ? { code: entry } : entry;
    const { code } = item;
    // Every require.resolve call with a string literal is reported, except the 'ignored' specifier.
    const errors = [
      ...code.matchAll(/require(?:\.resolve|\[['"]resolve['"]\])(?=\(['"](?!ignored)[^'"]+['"]\))/gu),
    ].map((match) => {
      const prefix = code.slice(0, match.index);
      const line = prefix.split('\n').length;
      const column = match.index - prefix.lastIndexOf('\n');
      return {
        message: 'Consider import.meta.resolve for module resolution in Bun ESM.',
        line,
        column,
        endLine: line,
        endColumn: column + match[0].length,
        suggestions: [],
      };
    });
    const base = { ...item, count: errors.length, errors };
    return item.ts ? [base] : [base, { ...base, ts: true }];
  }),
};
