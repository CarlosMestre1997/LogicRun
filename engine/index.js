// Main engine module - combines all engine components
import { parse } from './commands.js';
import { createExecutor } from './executor.js';
import { calculateScore } from './rules.js';

export function createEngine(level) {
  const executor = createExecutor(level);
  
  return {
    state: executor.state,
    parse: parse,
    execute: executor.execute
  };
}

export { calculateScore };

