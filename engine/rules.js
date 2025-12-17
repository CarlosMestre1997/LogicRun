// Game rules: collisions, win/lose conditions
import { isGoal } from '../levels/helpers.js';

export function checkWinCondition(state, level) {
  return isGoal(level, state.x, state.y);
}

export function calculateScore(commandCount) {
  // Score: 950 for 1 command, 900 for 2, 850 for 3, etc.
  return Math.max(100, 1000 - (commandCount * 50));
}

