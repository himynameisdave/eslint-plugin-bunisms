# prefer-fetch

📝 Prefer `fetch()` over the corresponding Node.js APIs.

⚠️ This rule _warns_ in the following [configs](https://github.com/himynameisdave/eslint-plugin-bunisms#eslint): 🔒 `strict`, 🌐 `all`.

Bun supports [`fetch()`](https://bun.sh/docs/runtime/networking/fetch) for HTTP and HTTPS requests and recommends it for most client requests. This rule reports binding-resolved calls to `get()` and `request()` from `node:http` and `node:https`, including default, named, namespace and CommonJS imports. It does not report server APIs or unrelated functions with the same names. The rule is diagnostic only because migrating can change callback handling, response streaming, TLS settings, agents, and socket behavior.

Use `fetch()` when its promise-based request and response model fits. Keep the Node client APIs when you rely on agents, callbacks, streaming semantics, TLS options, or sockets that do not map cleanly to Fetch.

## Examples

```ts
// ❌
import https from 'node:https';
https.get(url, callback);
https.request(url, options);
```

```ts
// ✅
const response = await fetch(url);
```

```ts
// ✅ Keep this server API
import http from 'node:http';
http.createServer(handler);
```
