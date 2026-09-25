import { createRule } from '../utils/create-rule.js';
export default createRule('prefer-bun-write', { writeFile: 'Bun.write()' }, ['fs', 'fs/promises'], true);
