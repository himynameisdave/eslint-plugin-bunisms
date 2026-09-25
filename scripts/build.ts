import { rm } from "node:fs/promises";
await rm("dist", { recursive: true, force: true });
const result = await Bun.build({ entrypoints: ["src/index.ts"], outdir: "dist", target: "node", format: "esm", minify: false });
if (!result.success) throw new AggregateError(result.logs, "Build failed");
