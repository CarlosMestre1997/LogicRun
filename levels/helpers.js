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
  // Check if goal is defined separately (elevated goal)
  if (level.goal && level.goal.x === x && level.goal.y === y) {
    return true;
  }
  // Check if tile type is goal (ground-level goal)
  const tile = getTile(level, x, y);
  return tile.type === 'goal';
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
  if (level.goal && level.goal.x === x && level.goal.y === y && level.goal.height > 0) {
    return true;
  }
  // Check if tile has height property
  const tile = getTile(level, x, y);
  return tile.type === 'lifted' || (tile.height !== undefined && tile.height > 0);
}

export function getTileHeight(level, x, y) {
  // Check if goal is elevated at this position
  if (level.goal && level.goal.x === x && level.goal.y === y && level.goal.height > 0) {
    return level.goal.height;
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

