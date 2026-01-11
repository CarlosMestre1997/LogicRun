// Level 8 configuration - laptop required with while loop challenge - 2 goals to reach

export const level8 = {
  width: 9,
  height: 5,
  start: { x: 0, y: 4 },
  goals: [{ x: 3, y: 0 }, { x: 8, y: 4 }], // Two goals along the path
  laptop: { x: 2, y: 4 }, // Laptop position - need to pick it up first
  tiles: [
    // Row 0 - y=0 (top row)
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'goal' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 1 - y=1
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 2 - y=2
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 3 - y=3
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 4 - y=4 (bottom row) - start at x:0, laptop at x:2, goal at x:7
    [{ type: 'start' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'goal' }]
  ],
  allowJump: true,
  levelNumber: 8
};
