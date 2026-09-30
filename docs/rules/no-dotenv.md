# no-dotenv

📝 Avoid redundant dotenv initialization when targeting Bun.

⚠️ This rule _warns_ in the following [configs](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint): ✅ `recommended`, 🔒 `strict`, 🌐 `all`.

Bun loads `.env` files automatically, so dotenv is not needed when Bun runs your code. This rule reports `dotenv/config` and `dotenv/config.js` imports (static, dynamic or `require`), and `config()` / `configDotenv()` calls with no options or only `quiet` / `debug`. It respects import bindings and lexical shadowing, and does not report calls with other options, calls whose return value is used, or type-only imports. It is a diagnostic only; it does not change code.

Check these differences before removing dotenv: Bun expands `$VAR` and `${VAR}` in values, even inside single quotes (escape with `\$`), while dotenv does not. Bun also loads `.env.{NODE_ENV}`, `.env.local` and `.env.{NODE_ENV}.local`. dotenv v18 reads `DOTENV_PATH` / `DOTENV_CONFIG_PATH` from the environment, even with no options.

Keep dotenv for code that runs under Node. This includes tools started from `package.json` scripts through `bun run`, such as `next dev` or `vite`: Bun does not pass `.env` values to those child processes, even with `--bun`. Also keep it when automatic loading is turned off with `--no-env-file` or `env = false` in `bunfig.toml`. See Bun's [environment variables guide](https://bun.com/docs/runtime/environment-variables).

## Examples

```js
// ❌
import 'dotenv/config';

// ✅
// Bun loads .env files automatically.
```

```js
// ❌
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

// ✅
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });
```
