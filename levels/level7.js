// Level 7 configuration - data-driven level definition
// Trail-like path with multiple routes and elevated tiles - S-shaped design
export const level7 = {
  width: 6,
  height: 6,
  start: { x: 0, y: 5 },
  goal: { x: 5, y: 0 },
  tiles: [
    // Row 0 - Top of S (curves to right)
    [{ type: 'void' }, { type: 'void' }, { type: 'void' }, { type: 'floor' }, { type: 'floor', height: 1 }, { type: 'goal' }],
    // Row 1 - Top curve of S
    [{ type: 'void' }, { type: 'void' }, { type: 'floor', height: 1 }, { type: 'floor', height: 1 }, { type: 'floor', height: 1 }, { type: 'floor' }],
    // Row 2 - Middle of S (vertical center)
    [{ type: 'void' }, { type: 'floor' }, { type: 'floor', height: 1 }, { type: 'floor' }, { type: 'void' }, { type: 'void' }],
    // Row 3 - Middle curve of S
    [{ type: 'floor' }, { type: 'floor', height: 1 }, { type: 'floor', height: 1 }, { type: 'floor' }, { type: 'void' }, { type: 'void' }],
    // Row 4 - Bottom curve of S
    [{ type: 'floor', height: 1 }, { type: 'floor', height: 1 }, { type: 'floor', height: 1 }, { type: 'floor' }, { type: 'floor' }, { type: 'void' }],
    // Row 5 - Bottom of S (curves to right from start)
    [{ type: 'start' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'void' }, { type: 'void' }]
  ],
  allowJump: true,
  levelNumber: 7
};
