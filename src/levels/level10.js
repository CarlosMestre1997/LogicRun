// Level 10 configuration - final challenge with laptop and while loop
// Based on level 7's S-shape but more complex with repetitive patterns
// Challenge: Master the while(hacking) loop to complete the final level efficiently
// Two goals to reach - optimal solution uses while loop to handle the repetitive S-curve pattern
export const level10 = {
  width: 8,
  height: 8,
  start: { x: 0, y: 7 },
  goals: [{ x: 7, y: 0 }, { x: 5, y: 4 }], // Two goals to reach
  laptop: { x: 3, y: 6 }, // Laptop in the middle of the S-curve
  tiles: [
    // Row 0 - Top of S (curves to right) - goal here
    [{ type: 'void' }, { type: 'void' }, { type: 'void' }, { type: 'void' }, { type: 'void' }, { type: 'void' }, { type: 'void' }, { type: 'goal' }],
    // Row 1 - Top curve of S
    [{ type: 'void' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 2 - Middle of S (vertical center)
    [{ type: 'void' }, { type: 'floor' }, { type: 'void' }, { type: 'void' }, { type: 'void' }, { type: 'void' }, { type: 'void' }, { type: 'void' }],
    // Row 3 - Path continues (laptop at x:7)
    [{ type: 'void' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 4 - Second goal at x:7
    [{ type: 'void' }, { type: 'void' }, { type: 'void' }, { type: 'floor' }, { type: 'void' }, { type: 'goal' }, { type: 'void' }, { type: 'floor' }],
    // Row 5 - Ground level path
    [{ type: 'void' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    // Row 6 - Ground level, narrow path
    [{ type: 'void' }, { type: 'floor' }, { type: 'void' }, { type: 'floor' }, { type: 'void' }, { type: 'void' }, { type: 'void' }, { type: 'floor' }],
    // Row 7 - Start at x:0
    [{ type: 'start' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }]
  ],
  allowJump: true,
  levelNumber: 10
};

