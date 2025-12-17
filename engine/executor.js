// Command execution - logic first, animation second
import { createState, nextTile, rotateFacing, DIR } from './state.js';
import { isValidPosition, isHole, isGoal } from '../levels/helpers.js';

// Animation queue item
function createAnimation(type, from, to, duration, callback) {
  return { type, from, to, duration, callback, startTime: null };
}

export function createExecutor(level) {
  const state = createState();
  let animationQueue = [];
  let currentAnimation = null;
  
  // Animation interpolation (visual only, never affects state)
  function lerp(start, end, t) {
    return start + (end - start) * t;
  }
  
  function updateAnimation(now) {
    if (!currentAnimation) {
      if (animationQueue.length === 0) {
        return;
      }
      currentAnimation = animationQueue.shift();
      currentAnimation.startTime = now;
    }
    
    const elapsed = now - currentAnimation.startTime;
    const progress = Math.min(elapsed / currentAnimation.duration, 1);
    
    if (currentAnimation.type === 'move') {
      const t = progress;
      // Animation values (for rendering only)
      state.animX = lerp(currentAnimation.from.x, currentAnimation.to.x, t);
      state.animY = lerp(currentAnimation.from.y, currentAnimation.to.y, t);
    } else if (currentAnimation.type === 'jump') {
      const t = progress;
      state.animX = lerp(currentAnimation.from.x, currentAnimation.to.x, t);
      state.animY = lerp(currentAnimation.from.y, currentAnimation.to.y, t);
      // Height animation: up then down
      const z = progress < 0.5 
        ? lerp(0, 1, progress * 2)
        : lerp(1, 0, (progress - 0.5) * 2);
      state.animZ = z;
    } else if (currentAnimation.type === 'fall') {
      // Falling animation: character sinks into hole/void
      const t = progress;
      state.animZ = lerp(currentAnimation.from.z, currentAnimation.to.z, t);
      // Also fade out as character sinks
      state.animAlpha = 1 - (t * 0.7); // Fade to 30% opacity
    } else if (currentAnimation.type === 'spin') {
      state.animRotation = progress * 360;
    }
    
    if (progress >= 1) {
      // Animation complete - snap to final position
      if (currentAnimation.type === 'move' || currentAnimation.type === 'jump') {
        // Ensure we're at the exact final position (no interpolation artifacts)
        state.animX = currentAnimation.to.x;
        state.animY = currentAnimation.to.y;
        if (currentAnimation.type === 'jump') {
          state.animZ = 0;
        }
      }
      
      // Call callback
      const callback = currentAnimation.callback;
      currentAnimation = null;
      
      // Clear animation after a brief moment to ensure final position is drawn
      setTimeout(() => {
        delete state.animX;
        delete state.animY;
        delete state.animZ;
        delete state.animRotation;
        delete state.animAlpha;
        if (callback) callback();
      }, 16);
    }
  }
  
  // Start animation loop
  let animationId = null;
  function startAnimationLoop(draw) {
    if (animationId) return;
    
    function animate(now) {
      updateAnimation(now);
      draw(state);
      
      if (animationQueue.length > 0 || currentAnimation) {
        animationId = requestAnimationFrame(animate);
      } else {
        animationId = null;
      }
    }
    animationId = requestAnimationFrame(animate);
  }
  
  function animateGhost() {
    // Fly up to the top of the screen (negative Y means above viewport)
    if (state.ghostY > -300) {
      state.ghostY -= 6; // Faster movement
      draw(state);
      setTimeout(animateGhost, 16);
    } else {
      // Reset to start position after ghost animation
      state.x = level.start.x;
      state.y = level.start.y;
      state.z = 0;
      state.facing = 'SE';
      state.ghostVisible = false;
      state.ghostY = undefined;
      state.failed = false;
      // Clear any animation values
      delete state.animX;
      delete state.animY;
      delete state.animZ;
      delete state.animRotation;
      draw(state);
      onFinish(state);
    }
  }
  
  // Helper to get ghost starting Y position at the tile where character fell
  function getGhostStartY() {
    if (!window.gridInfo) return 160;
    const gridInfo = window.gridInfo;
    const ISO_TILE_HEIGHT = gridInfo.isoTileHeight || 35;
    const ISO_OFFSET_Y = gridInfo.offsetY || 120;
    const isoY = ISO_OFFSET_Y + (state.x + state.y) * (ISO_TILE_HEIGHT / 2);
    const tileTopY = isoY - ISO_TILE_HEIGHT / 2;
    return tileTopY;
  }
  
  function execute(actions, draw, onFinish) {
    state.queue = [...actions];
    state.failed = false;
    state.ghostVisible = false;
    state.ghostY = undefined;
    state.stepCount = actions.length;
    
    // Reset to start position
    state.x = level.start.x;
    state.y = level.start.y;
    state.z = 0;
    state.facing = 'SE';
    
    function processAction() {
      if (state.queue.length === 0) {
        // All actions processed, wait for animations to finish
        if (!currentAnimation && animationQueue.length === 0) {
          onFinish(state);
        }
        return;
      }

      const action = state.queue.shift();

      if (action.type === 'move') {
        const target = nextTile(state);
        
        // Check if this move will fail
        const willFail = !isValidPosition(level, target.x, target.y) || isHole(level, target.x, target.y);
        
        // COMMIT STATE (logic) - always move to target
        const fromPos = { x: state.x, y: state.y };
        state.x = target.x;
        state.y = target.y;
        
        // QUEUE ANIMATION (visual interpolation)
        animationQueue.push(createAnimation(
          'move',
          fromPos,
          { x: state.x, y: state.y },
          400,
          () => {
            // After move animation completes, check if we should fall
            if (willFail) {
              // Character moved into hole/void - show falling animation
              state.failed = true;
              animationQueue.push(createAnimation(
                'fall',
                { z: 0 },
                { z: -2 }, // Sink below ground
                400,
                () => {
                  // After falling, show ghost
                  state.ghostVisible = true;
                  state.ghostY = getGhostStartY();
                  draw(state);
                  animateGhost();
                }
              ));
              startAnimationLoop(draw);
            } else {
              // Successful move, continue
              processAction();
            }
          }
        ));
        
        startAnimationLoop(draw);
        return;
      }

      if (action.type === 'jump') {
        if (!level.allowJump) {
          state.failed = true;
          onFinish(state);
          return;
        }
        
        // Jump moves 2 tiles forward in facing direction
        const jumpTarget = {
          x: state.x + DIR[state.facing].dx * 2,
          y: state.y + DIR[state.facing].dy * 2
        };
        
        // Store target for validation after animation
        const willFail = !isValidPosition(level, jumpTarget.x, jumpTarget.y) || isHole(level, jumpTarget.x, jumpTarget.y);
        
        // COMMIT STATE - always move to target position
        const fromPos = { x: state.x, y: state.y };
        state.x = jumpTarget.x;
        state.y = jumpTarget.y;
        state.z = 0; // Will be set during animation
        
        // QUEUE JUMP ANIMATION (always play the jump)
        animationQueue.push(createAnimation(
          'jump',
          fromPos,
          { x: state.x, y: state.y },
          600,
          () => {
            // After jump animation completes, check if we should fall
            if (willFail) {
              // Character landed on hole/void - show falling animation
              state.failed = true;
              // Falling animation: character sinks down
              animationQueue.push(createAnimation(
                'fall',
                { z: 0 },
                { z: -2 }, // Sink below ground
                400,
                () => {
                  // After falling, show ghost
                  state.ghostVisible = true;
                  state.ghostY = getGhostStartY();
                  draw(state);
                  animateGhost();
                }
              ));
              startAnimationLoop(draw);
            } else {
              // Successful jump, continue
              processAction();
            }
          }
        ));
        
        startAnimationLoop(draw);
        return;
      }

      if (action.type === 'spin') {
        // LOGIC FIRST: Update facing (discrete state change)
        state.facing = rotateFacing(state.facing, action.direction);
        
        // QUEUE ANIMATION (visual only)
        animationQueue.push(createAnimation(
          'spin',
          {},
          {},
          200,
          () => processAction()
        ));
        
        startAnimationLoop(draw);
        return;
      }
    }

    // Start processing
    if (actions.length === 0) {
      // No actions, finish immediately
      onFinish(state);
    } else {
      processAction();
      draw(state);
    }
  }

  return { state, execute };
}
