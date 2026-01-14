// Level 6 configuration - data-driven level definition
// Trail-like path with multiple routes and elevated tiles - S-shaped design
export const level6 = {
  width: 6,
  height: 6,
  start: { x: 0, y: 5 },
  goal: { x: 5, y: 0 },
  tiles: [
    // Row 0 - Top of S (curves to right)
    [{ type: 'void' }, { type: 'void' }, { type: 'void' }, { type: 'void' }, { type: 'void' }, { type: 'goal'}],
    // Row 1 - Top curve of S
    [{ type: 'void' }, { type: 'floor' }, { type: 'floor'}, { type: 'floor'}, { type: 'floor'}, { type: 'floor'}],
    // Row 2 - Middle of S (vertical center)
    [{ type: 'void' }, { type: 'floor' }, { type: 'void'}, { type: 'void' }, { type: 'void' }, { type: 'void' }],
    // Row 3 
    [{ type: 'void' }, { type: 'floor'}, { type: 'floor'}, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 4 
    [{ type: 'void'}, { type: 'void'}, { type: 'void'}, { type: 'void' }, { type: 'void' }, { type: 'floor' }],
    // Row 5 
    [{ type: 'start' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }]
  ],
  allowJump: true,
  levelNumber: 6
};
