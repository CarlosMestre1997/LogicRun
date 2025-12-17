// Level 3 configuration - data-driven level definition
export const level3 = {
  width: 7,
  height: 7,
  start: { x: 0, y: 3 },
  goal: { x: 6, y: 0 },
  tiles: [
    // Row 0
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'hole' }, { type: 'floor' }, { type: 'floor' }, { type: 'goal' }],
    // Row 1
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'hole' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 2
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'hole' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 3 - start at x:0, goal at x:6
    [{ type: 'start' }, { type: 'floor' }, { type: 'floor' }, { type: 'hole' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 4
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 5
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 6
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }]
  ],
  allowJump: true,
  levelNumber: 3
};

