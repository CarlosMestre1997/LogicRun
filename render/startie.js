// Character (Startie) rendering - uses discrete grid coordinates
import { facingToSprite } from '../engine/state.js';

const sprites = {
  'rd': new Image(),
  'ru': new Image(),
  'lu': new Image(),
  'ld': new Image()
};

let spritesLoaded = 0;

export function loadSprites(callback) {
  const onLoad = () => {
    spritesLoaded++;
    if (spritesLoaded === 4 && callback) callback();
  };
  
  const isLevelPage = window.location.pathname.includes('levels/');
  const assetPath = isLevelPage ? '../assets/' : './assets/';
  
  sprites.rd.src = assetPath + 'startie-rd.png';
  sprites.ru.src = assetPath + 'startie-ru.png';
  sprites.lu.src = assetPath + 'startie-lu.png';
  sprites.ld.src = assetPath + 'startie-ld.png';
  
  sprites.rd.onload = onLoad;
  sprites.ru.onload = onLoad;
  sprites.lu.onload = onLoad;
  sprites.ld.onload = onLoad;
}

export function drawStartie(ctx, state) {
  if (state.ghostVisible) return;
  
  if (!window.gridInfo) return;
  
  const gridInfo = window.gridInfo;
  
  // Use animation position if available, otherwise use discrete state position
  // Only use animation values if they're valid (not undefined/null)
  const displayX = (state.animX !== undefined && state.animX !== null) ? state.animX : state.x;
  const displayY = (state.animY !== undefined && state.animY !== null) ? state.animY : state.y;
  const displayZ = (state.animZ !== undefined && state.animZ !== null) ? state.animZ : state.z;
  
  // Convert grid coordinates to isometric screen coordinates
  // Use the same offset calculation as the grid
  const ISO_TILE_WIDTH = gridInfo.isoTileWidth || 50;
  const ISO_TILE_HEIGHT = gridInfo.isoTileHeight || 25;
  const ISO_OFFSET_X = gridInfo.offsetX || 300;
  const ISO_OFFSET_Y = gridInfo.offsetY || 120;
  
  // Use the exact same formula as gridToIso in grid.js
  const isoX = ISO_OFFSET_X + (displayX - displayY) * (ISO_TILE_WIDTH / 2);
  const isoY = ISO_OFFSET_Y + (displayX + displayY) * (ISO_TILE_HEIGHT / 2);
  
  // Character should be positioned at the top-center of the isometric tile
  // The top point of the diamond is at isoY - ISO_TILE_HEIGHT / 2
  const tileTopY = isoY - ISO_TILE_HEIGHT / 2;
  
  // Apply height offset (z * tile height) - subtract for jumping
  const heightOffset = displayZ * ISO_TILE_HEIGHT * 2;
  
  const pixelX = isoX + ISO_TILE_WIDTH / 2;  // Center horizontally
  const pixelY = tileTopY - heightOffset;     // Top of tile, minus jump height
  
  // Get sprite based on facing direction
  const spriteVariant = facingToSprite(state.facing);
  const currentSprite = sprites[spriteVariant];
  
  if (currentSprite && currentSprite.complete && currentSprite.naturalWidth > 0) {
    const spriteSize = (gridInfo.isoTileWidth || 70) * 0.9;  // Increased from 0.8 to 0.9 and base size
    const spriteX = pixelX - spriteSize / 2;
    const spriteY = pixelY - spriteSize / 2;
    
    ctx.save();
    
    // Apply alpha if falling
    if (state.animAlpha !== undefined) {
      ctx.globalAlpha = state.animAlpha;
    }
    
    // Apply rotation if spinning
    if (state.animRotation !== undefined) {
      ctx.translate(pixelX, pixelY);
      ctx.rotate((state.animRotation * Math.PI) / 180);
      ctx.drawImage(currentSprite, -spriteSize / 2, -spriteSize / 2, spriteSize, spriteSize);
    } else {
      ctx.drawImage(currentSprite, spriteX, spriteY, spriteSize, spriteSize);
    }
    
    ctx.restore();
  }
}

export function areSpritesLoaded() {
  return spritesLoaded === 4;
}
