// Main render module - combines grid, startie, and animations
import { drawGrid, loadLaptopImage, isLaptopImageLoaded } from './grid.js';
import { loadSprites, drawStartie, areSpritesLoaded } from './startie.js';
import { loadCelebrateSprite, drawGhostAtPosition } from './animations.js';

let animationId = null;

export function initRenderer(callback, level = null) {
  let spritesReady = false;
  let celebrateReady = false;
  let laptopReady = true; // Default to true, only false if level has laptop
  
  const checkReady = () => {
    if (spritesReady && celebrateReady && laptopReady && callback) callback();
  };
  
  loadSprites(() => {
    spritesReady = true;
    checkReady();
  });
  
  loadCelebrateSprite(() => {
    celebrateReady = true;
    checkReady();
  });
  
  // Preload laptop image if level has laptop
  if (level && level.laptop) {
    laptopReady = false;
    loadLaptopImage(() => {
      laptopReady = true;
      checkReady();
    });
  } else {
    checkReady();
  }
}

export function drawLevel(ctx, level, state) {
  drawLevelFrame(ctx, level, state);
  
  // Redraw when sprites or laptop image load
  const needsLaptop = level && level.laptop;
  const assetsLoaded = areSpritesLoaded() && (!needsLaptop || isLaptopImageLoaded());
  
  if (!assetsLoaded && !animationId) {
    function checkAndRender() {
      const needsLaptopCheck = level && level.laptop;
      const allAssetsLoaded = areSpritesLoaded() && (!needsLaptopCheck || isLaptopImageLoaded());
      if (allAssetsLoaded) {
        drawLevelFrame(ctx, level, state);
        animationId = null;
      } else {
        animationId = requestAnimationFrame(checkAndRender);
      }
    }
    animationId = requestAnimationFrame(checkAndRender);
  }
}

function drawLevelFrame(ctx, level, state) {
  // Draw grid (data-driven from level tiles)
  drawGrid(ctx, level, state);
  
  // Draw character (uses discrete x, y, z coordinates)
  if (!state.ghostVisible) {
    drawStartie(ctx, state);
  }
  
  // Draw ghost if visible
  if (state.ghostVisible && state.ghostY !== undefined && window.gridInfo) {
    drawGhostAtPosition(ctx, state, window.gridInfo);
  }
  
  // Celebration is now drawn as HTML overlay, not on canvas
}

