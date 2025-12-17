// Level 2 configuration - data-driven level definition
export const level2 = {
  width: 5,
  height: 5,
  start: { x: 0, y: 2 },
  goal: { x: 4, y: 2 },
  tiles: [
    // Single row: start, floor, floor, floor, hole, floor, goal
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    [{ type: 'floor' }, { type: 'floor' }, { type: 'hole' }, { type: 'floor' }, { type: 'goal' }],
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
    [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }, { type: 'floor' }]
  ],
  allowJump: true,
  levelNumber: 2
};
