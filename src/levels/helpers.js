// Shared level helper functions
export function getTile(level, x, y) {
  if (x < 0 || x >= level.width || y < 0 || y >= level.height) {
    return { type: 'void' };
  }
  return level.tiles[y][x] || { type: 'void' };
}

export function isHole(level, x, y) {
  const tile = getTile(level, x, y);
  return tile.type === 'hole';
}

export function isGoal(level, x, y) {
  // All levels now use goals[] array
  return level.goals && level.goals.some(g => g.x === x && g.y === y);
}

export function getGoalAt(level, x, y) {
  return level.goals ? level.goals.find(g => g.x === x && g.y === y) : null;
}

export function getGoalHeight(level, x, y) {
  const goal = getGoalAt(level, x, y);
  return goal?.height || 0;
}

export function isValidPosition(level, x, y) {
  if (x < 0 || x >= level.width || y < 0 || y >= level.height) {
    return false;
  }
  const tile = getTile(level, x, y);
  return tile.type !== 'void' && tile.type !== 'hole';
}

export function isLiftedTile(level, x, y) {
  // Check if goal is elevated at this position
  const goal = getGoalAt(level, x, y);
  if (goal && goal.height > 0) {
    return true;
  }
  
  // Check if tile has height property
  const tile = getTile(level, x, y);
  return tile.type === 'lifted' || (tile.height !== undefined && tile.height > 0);
}

export function getTileHeight(level, x, y) {
  // Check if goal is elevated at this position
  const goal = getGoalAt(level, x, y);
  if (goal && goal.height > 0) {
    return goal.height;
  }
  
  // Check if tile has height property
  const tile = getTile(level, x, y);
  if (tile.type === 'lifted' || (tile.height !== undefined && tile.height > 0)) {
    return tile.height || 1;
  }
  return 0;
}

export function isLaptop(level, x, y) {
  // Check if this position matches the laptop position in the level
  if (level.laptop && level.laptop.x === x && level.laptop.y === y) {
    return true;
  }
  return false;
}

