// Level 6 configuration - data-driven level definition
// Introduces multiple paths using voids - player must find the fastest route
export const level6 = {
  width: 8,
  height: 7,
  start: { x: 0, y: 3 },
  goal: { x: 7, y: 5 },
  tiles: [
    
  
    // Row 0
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'void' }, { type: 'void' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 1
    [{ type: 'floor' }, { type: 'void' }, { type: 'void' }, { type: 'floor' }, { type: 'floor' }, { type: 'void' }, { type: 'void' }, { type: 'floor' }],
    // Row 2
    [{ type: 'floor' }, { type: 'void' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'void' }, { type: 'floor' }],
    // Row 3 - start at x:0, goal at x:7
    [{ type: 'start' }, { type: 'floor' }, { type: 'floor' }, { type: 'void' }, { type: 'void' }, { type: 'floor' }, { type: 'floor' }, { type: 'void' }],
    // Row 4
    [{ type: 'floor' }, { type: 'void' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'void' }, { type: 'floor' }],
    // Row 5
    [{ type: 'floor' }, { type: 'void' }, { type: 'void' }, { type: 'floor' }, { type: 'floor' }, { type: 'void' }, { type: 'void' }, { type: 'goal' }],
    // Row 6
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'void' }, { type: 'void' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }]
  ],
  allowJump: true,
  levelNumber: 6
};

