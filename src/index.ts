import type { ESLint, Linter } from "eslint";
import preferBunFile from "./rules/prefer-bun-file.js";
import preferBunWrite from "./rules/prefer-bun-write.js";
import preferBunSpawn from "./rules/prefer-bun-spawn.js";

const rules = {
  "prefer-bun-file": preferBunFile,
  "prefer-bun-write": preferBunWrite,
  "prefer-bun-spawn": preferBunSpawn,
};
type Preset = "recommended" | "strict" | "all";
const plugin: ESLint.Plugin & { rules: typeof rules; configs: Record<Preset, Linter.Config> } = {
  meta: { name: "eslint-plugin-bunisms", version: "0.1.0" },
  rules,
  configs: {} as Record<Preset, Linter.Config>,
};
for (const preset of ["recommended", "strict", "all"] as const) {
  plugin.configs[preset] = {
    name: `bun/${preset}`,
    plugins: { bun: plugin },
    rules: Object.fromEntries(Object.keys(rules).map((name) => [`bun/${name}`, "warn" as const])),
  };
}
export default plugin;
