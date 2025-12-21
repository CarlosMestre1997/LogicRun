// Game state management - discrete grid coordinates
export function createState() {
  return {
    x: 0,        // grid column (integer)
    y: 0,        // grid row (integer)
    z: 0,        // height: 0 = ground, 1 = jumping (integer)
    facing: 'SE', // SE, NE, NW, SW
    queue: [],   // animation queue
    failed: false,
    ghostVisible: false,
    ghostY: undefined, // for ghost animation only
    stepCount: 0,
    hasLaptop: false // track if player has picked up laptop
  };
}

export function resetState(state) {
  state.x = 0;
  state.y = 0;
  state.z = 0;
  state.facing = 'SE';
  state.queue = [];
  state.failed = false;
  state.ghostVisible = false;
  state.ghostY = undefined;
  state.stepCount = 0;
  state.hasLaptop = false;
}

// Direction vectors
export const DIR = {
  SE: { dx: 1, dy: 0 },  // Southeast (right in isometric)
  NE: { dx: 0, dy: -1 }, // Northeast (up in isometric)
  NW: { dx: -1, dy: 0 }, // Northwest (left in isometric)
  SW: { dx: 0, dy: 1 }   // Southwest (down in isometric)
};

// Get next tile position based on facing direction
export function nextTile(state) {
  const dir = DIR[state.facing];
  return {
    x: state.x + dir.dx,
    y: state.y + dir.dy,
    z: state.z
  };
}

// Map facing to sprite variant
export function facingToSprite(facing) {
  const map = {
    'SE': 'rd',
    'NE': 'ru',
    'NW': 'lu',
    'SW': 'ld'
  };
  return map[facing] || 'rd';
}

// Rotate facing direction
// spin(l): rd -> ru -> lu -> ld (SE -> NE -> NW -> SW)
// spin(r): rd -> ld -> lu -> ru (SE -> SW -> NW -> NE)
export function rotateFacing(facing, direction) {
  const order = ['SE', 'NE', 'NW', 'SW'];
  const currentIndex = order.indexOf(facing);
  
  // Swapped: left goes forward, right goes backward
  if (direction === 'left') {
    return order[(currentIndex + 1) % order.length];
  } else {
    return order[(currentIndex - 1 + order.length) % order.length];
  }
}
