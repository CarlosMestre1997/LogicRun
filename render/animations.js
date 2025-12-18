// Animation effects (ghost, etc.)
export function drawGhost(ctx, x, y) {
  ctx.save();
  // Alpha should be set by caller before calling this function
  // If not set, default to 0.7
  if (ctx.globalAlpha === 1.0) {
    ctx.globalAlpha = 0.7;
  }
  
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(x, y + 20, 15, Math.PI, 0, false);
  ctx.lineTo(x + 15, y + 40);
  ctx.lineTo(x + 5, y + 30);
  ctx.lineTo(x - 5, y + 30);
  ctx.lineTo(x - 15, y + 40);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(x - 5, y + 18, 2, 0, Math.PI * 2);
  ctx.arc(x + 5, y + 18, 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

export function drawGhostAtPosition(ctx, state, gridInfo) {
  if (!state.ghostVisible || state.ghostY === undefined) return;
  
  if (!gridInfo) return;
  
  // Calculate ghost position using the same isometric conversion as the character
  const ISO_TILE_WIDTH = gridInfo.isoTileWidth || 50;
  const ISO_TILE_HEIGHT = gridInfo.isoTileHeight || 25;
  const ISO_OFFSET_X = gridInfo.offsetX || 300;
  const ISO_OFFSET_Y = gridInfo.offsetY || 120;
  
  // Use the exact same formula as gridToIso in grid.js
  const isoX = ISO_OFFSET_X + (state.x - state.y) * (ISO_TILE_WIDTH / 2);
  const isoY = ISO_OFFSET_Y + (state.x + state.y) * (ISO_TILE_HEIGHT / 2);
  
  // Ghost appears at the top-center of the tile where character fell
  const tileTopY = isoY - ISO_TILE_HEIGHT / 2;
  const ghostX = isoX + ISO_TILE_WIDTH / 2;  // Center horizontally
  // Use the animated Y position - it starts at tileTopY and decreases (flies up)
  const ghostY = state.ghostY;
  
  // Only draw if ghostY is defined and valid
  if (ghostY !== undefined && ghostY !== null) {
    ctx.save();
    // Apply alpha fade if ghostAlpha is set (multiply with base 0.7)
    const baseAlpha = 0.7;
    const fadeAlpha = state.ghostAlpha !== undefined ? state.ghostAlpha * baseAlpha : baseAlpha;
    ctx.globalAlpha = fadeAlpha;
    drawGhost(ctx, ghostX, ghostY);
    ctx.restore();
  }
}

