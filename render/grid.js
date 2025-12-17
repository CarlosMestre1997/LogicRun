// Grid rendering - data-driven from level tiles (isometric)
const ISO_TILE_WIDTH = 70;  // Increased from 50
const ISO_TILE_HEIGHT = 35;  // Increased from 25

// Convert grid coordinates to isometric screen coordinates
function gridToIso(gridX, gridY, offsetX = 0, offsetY = 0) {
  const isoX = offsetX + (gridX - gridY) * (ISO_TILE_WIDTH / 2);
  const isoY = offsetY + (gridX + gridY) * (ISO_TILE_HEIGHT / 2);
  return { x: isoX, y: isoY };
}

// Draw an isometric tile
function drawIsoTile(ctx, gridX, gridY, color, height = 0, offsetX = 0, offsetY = 0) {
  const { x, y } = gridToIso(gridX, gridY, offsetX, offsetY);
  
  ctx.save();
  
  // Draw side faces if height > 0
  if (height > 0) {
    const sideHeight = height * 10;
    const darkerColor = color === '#4fa3ff' ? '#3a8fdf' : '#bbb';
    
    // Left side
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + sideHeight);
    ctx.lineTo(x + ISO_TILE_WIDTH / 2, y + ISO_TILE_HEIGHT / 2 + sideHeight);
    ctx.lineTo(x + ISO_TILE_WIDTH / 2, y + ISO_TILE_HEIGHT / 2);
    ctx.closePath();
    ctx.fillStyle = darkerColor;
    ctx.fill();
    
    // Right side
    ctx.beginPath();
    ctx.moveTo(x + ISO_TILE_WIDTH / 2, y + ISO_TILE_HEIGHT / 2);
    ctx.lineTo(x + ISO_TILE_WIDTH / 2, y + ISO_TILE_HEIGHT / 2 + sideHeight);
    ctx.lineTo(x + ISO_TILE_WIDTH, y + sideHeight);
    ctx.lineTo(x + ISO_TILE_WIDTH, y);
    ctx.closePath();
    ctx.fillStyle = darkerColor;
    ctx.fill();
  }
  
  // Draw top face
  ctx.fillStyle = color;
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + ISO_TILE_WIDTH / 2, y - ISO_TILE_HEIGHT / 2);
  ctx.lineTo(x + ISO_TILE_WIDTH, y);
  ctx.lineTo(x + ISO_TILE_WIDTH / 2, y + ISO_TILE_HEIGHT / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  ctx.restore();
}

export function drawGrid(ctx, level) {
  // Clear canvas
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Calculate grid bounds for positioning
  const gridWidth = level.width;
  const gridHeight = level.height;
  
  // Calculate grid area bounds using base offsets
  const BASE_OFFSET_X = 300;
  const BASE_OFFSET_Y = 120;
  
  let minIsoX = Infinity, maxIsoX = -Infinity;
  let minIsoY = Infinity, maxIsoY = -Infinity;
  
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const { x: isoX, y: isoY } = gridToIso(x, y, BASE_OFFSET_X, BASE_OFFSET_Y);
      minIsoX = Math.min(minIsoX, isoX);
      maxIsoX = Math.max(maxIsoX, isoX + ISO_TILE_WIDTH);
      minIsoY = Math.min(minIsoY, isoY - ISO_TILE_HEIGHT / 2);
      maxIsoY = Math.max(maxIsoY, isoY + ISO_TILE_HEIGHT / 2);
    }
  }
  
  const gridAreaWidth = maxIsoX - minIsoX;
  const gridAreaHeight = maxIsoY - minIsoY;
  const gridX = (ctx.canvas.width - gridAreaWidth) / 2 - minIsoX + BASE_OFFSET_X;
  const gridY = (ctx.canvas.height - gridAreaHeight) / 2 - minIsoY + BASE_OFFSET_Y;
  
  // Store grid info for character positioning
  window.gridInfo = {
    x: 0, // Grid offset X (for isometric calculations)
    y: 0, // Grid offset Y (for isometric calculations)
    width: gridAreaWidth,
    height: gridAreaHeight,
    tileSize: ISO_TILE_WIDTH,
    isoTileWidth: ISO_TILE_WIDTH,
    isoTileHeight: ISO_TILE_HEIGHT,
    offsetX: gridX,
    offsetY: gridY
  };
  
  // Draw tiles from level data (isometric)
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const tile = level.tiles[y][x];
      
      if (tile.type === 'start' || tile.type === 'floor') {
        drawIsoTile(ctx, x, y, '#ddd', 0, gridX, gridY);
      } else if (tile.type === 'goal') {
        drawIsoTile(ctx, x, y, '#4fa3ff', 1, gridX, gridY);
      } else if (tile.type === 'hole') {
        // Draw hole as dark pit
        const { x: isoX, y: isoY } = gridToIso(x, y, gridX, gridY);
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(isoX, isoY);
        ctx.lineTo(isoX + ISO_TILE_WIDTH / 2, isoY - ISO_TILE_HEIGHT / 2);
        ctx.lineTo(isoX + ISO_TILE_WIDTH, isoY);
        ctx.lineTo(isoX + ISO_TILE_WIDTH / 2, isoY + ISO_TILE_HEIGHT / 2);
        ctx.closePath();
        ctx.fill();
      } else if (tile.type === 'void') {
        // Draw void tiles as subtle grid lines (optional - can be invisible)
        const { x: isoX, y: isoY } = gridToIso(x, y, gridX, gridY);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(isoX, isoY);
        ctx.lineTo(isoX + ISO_TILE_WIDTH / 2, isoY - ISO_TILE_HEIGHT / 2);
        ctx.lineTo(isoX + ISO_TILE_WIDTH, isoY);
        ctx.lineTo(isoX + ISO_TILE_WIDTH / 2, isoY + ISO_TILE_HEIGHT / 2);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }
  
  return true;
}
