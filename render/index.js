// Main render module - combines grid, startie, and animations
import { drawGrid } from './grid.js';
import { loadSprites, drawStartie, areSpritesLoaded } from './startie.js';
import { drawGhostAtPosition, drawCelebration, loadCelebrateSprite, isCelebrateLoaded } from './animations.js';

let animationContext = null;
let animationLevel = null;
let animationState = null;
let animationId = null;

export function initRenderer(callback) {
  let spritesReady = false;
  let celebrateReady = false;
  
  loadSprites(() => {
    spritesReady = true;
    if (spritesReady && celebrateReady && callback) callback();
  });
  
  loadCelebrateSprite(() => {
    celebrateReady = true;
    if (spritesReady && celebrateReady && callback) callback();
  });
}

export function drawLevel(ctx, level, state) {
  animationContext = ctx;
  animationLevel = level;
  animationState = state;
  
  drawLevelFrame(ctx, level, state);
  
  // Redraw when sprites load
  if (!areSpritesLoaded() && !animationId) {
    function checkAndRender() {
      if (areSpritesLoaded()) {
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
  drawGrid(ctx, level);
  
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

