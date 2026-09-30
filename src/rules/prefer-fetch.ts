import { createRule } from '../utils/create-rule.js';
export default createRule('prefer-fetch', { get: 'fetch()', request: 'fetch()' }, ['http', 'https']);
