// Level 5 configuration - introduces laptop pickup and while loops
export const level5 = {
  width: 7,
  height: 7,
  start: { x: 0, y: 3 },
  goal: { x: 6, y: 3 },
  laptop: { x: 3, y: 3 }, // Laptop position
  tiles: [
    // Row 0
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 1
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 2
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 3 - start at x:0, laptop at x:3 (on floor tile), goal at x:6
    [{ type: 'start' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'goal' }],
    // Row 4
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 5
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 6
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }]
  ],
  allowJump: true,
  levelNumber: 5
};

