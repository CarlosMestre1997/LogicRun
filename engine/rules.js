// Game rules: collisions, win/lose conditions
import { isGoal, getTile, getTileHeight } from '../levels/helpers.js';

export function checkWinCondition(state, level) {
  // Check if player is at goal position
  if (level.goal.x !== state.x || level.goal.y !== state.y) {
    return false;
  }
  
  // Check if goal is elevated - player must be at correct height
  // First check if level.goal has a height property (for elevated goals defined separately)
  let goalHeight = level.goal.height;
  // If not, check the tile's height property (for goal tiles with height in the tiles array)
  if (goalHeight === undefined) {
    goalHeight = getTileHeight(level, level.goal.x, level.goal.y);
  }
  
  if (goalHeight > 0 && state.z !== goalHeight) {
    return false; // Player is at goal position but not at correct height
  }
  if (goalHeight === 0 && state.z !== 0) {
    return false; // Goal is at ground level but player is elevated
  }
  
  // For levels with laptop requirement, must have laptop
  if (level.laptop !== undefined) {
    return state.hasLaptop;
  }
  
  return true;
}

// Count commands including loops (inner commands count, loop line counts as -1)
export function countCommands(actions) {
  let count = 0;
  for (const action of actions) {
    if (action.type === 'while') {
      // Loop line counts as -1, inner commands count normally
      count += countCommands(action.body) - 1;
    } else {
      count++;
    }
  }
  return count;
}

export function calculateScore(commandCount) {
  // Score: 950 for 1 command, 900 for 2, 850 for 3, etc.
  return Math.max(100, 1000 - (commandCount * 50));
}

