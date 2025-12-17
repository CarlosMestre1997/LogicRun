// Level 1 configuration - data-driven level definition (5x5 grid)
export const level1 = {
  width: 5,
  height: 5,
  start: { x: 0, y: 2 },
  goal: { x: 4, y: 2 },
  tiles: [
    // Row 0 (y: 0)
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 1 (y: 1)
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 2 (y: 2) - start at x:0, goal at x:4
    [{ type: 'start' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'goal' }],
    // Row 3 (y: 3)
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 4 (y: 4)
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }]
  ],
  allowJump: false,
  levelNumber: 1
};
