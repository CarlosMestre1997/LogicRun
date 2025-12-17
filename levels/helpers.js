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

