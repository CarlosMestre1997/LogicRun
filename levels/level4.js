// Level 4 configuration - data-driven level definition
// Introduces lifted tiles - goal is on a lifted tile that must be jumped onto
export const level4 = {
  width: 5,
  height: 5,
  start: { x: 0, y: 2 },
  goal: { x: 4, y: 0 },
  tiles: [
    // Row 0
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'goal', height: 1 }],
    // Row 1
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 2 - start at x:0, goal on lifted tile at x:6
    [{ type: 'start' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor'}],
    // Row 3
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 4
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }]
  ],
  allowJump: true,
  levelNumber: 4
};


