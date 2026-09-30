# no-dotenv

📝 Avoid redundant dotenv initialization when targeting Bun.

⚠️ This rule _warns_ in the following [configs](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint): ✅ `recommended`, 🔒 `strict`, 🌐 `all`.

Bun loads standard `.env` files automatically when running as `bun`. This rule reports `dotenv/config` imports and `dotenv.config()` calls without options, which use dotenv's standard environment file behavior. It respects import bindings and lexical shadowing, and does not report custom paths, options, unrelated functions, or type-only imports.

This is a diagnostic only; it does not remove dependencies or change code. Keep dotenv when running under Node, invoking Bun in Node compatibility mode (such as `bun --bun`), disabling automatic env loading, needing dotenv's `override` behavior, or loading a custom path. Bun can also be configured with `--no-env-file` or `env = false` in `bunfig.toml`. Scope this rule to code whose runtime configuration is known to use Bun's automatic env loading. The behavior is documented in Bun's [environment variables guide](https://bun.sh/docs/runtime/environment-variables).

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
dotenv.config();

// ✅
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });
```
