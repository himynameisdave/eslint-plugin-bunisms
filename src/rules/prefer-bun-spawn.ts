import { createRule } from '../utils/create-rule.js';
export default createRule('prefer-bun-spawn', { spawn: 'Bun.spawn()', spawnSync: 'Bun.spawnSync()' }, [
  'child_process',
]);
