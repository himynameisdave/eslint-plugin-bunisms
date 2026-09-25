import { createRule } from "../utils/create-rule.js";
export default createRule("prefer-bun-file", { readFile: "Bun.file()" }, ["fs", "fs/promises"], true);
