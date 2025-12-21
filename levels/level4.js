// Level 4 configuration - data-driven level definition
// Introduces lifted tiles - goal is on a lifted tile that must be jumped onto
// Ground level has void at goal position, goal is at height 1
export const level4 = {
  width: 5,
  height: 5,
  start: { x: 0, y: 2 },
  goal: { x: 4, y: 0, height: 1 }, // Goal is at height 1 (elevated)
  tiles: [
    // Row 0 - void at (4,0) ground level, goal is elevated at height 1
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'void' }],
    // Row 1
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 2 - start at x:0
    [{ type: 'start' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor'}],
    // Row 3
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 4
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }]
  ],
  allowJump: true,
  levelNumber: 4
};


