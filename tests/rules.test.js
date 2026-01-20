// Tests for game rules
import { describe, it, expect } from 'vitest';
import { checkWinCondition, countCommands, calculateScore } from '../src/engine/rules.js';

describe('Win Condition', () => {
  describe('single goal levels', () => {
    it('returns true when at goal position', () => {
      const state = { x: 2, y: 0, z: 0, visitedGoals: new Set() };
      const level = { goals: [{ x: 2, y: 0 }] };
      expect(checkWinCondition(state, level)).toBe(true);
    });

    it('returns false when not at goal', () => {
      const state = { x: 0, y: 0, z: 0, visitedGoals: new Set() };
      const level = { goals: [{ x: 2, y: 0 }] };
      expect(checkWinCondition(state, level)).toBe(false);
    });

    it('checks height for elevated goals', () => {
      const state = { x: 2, y: 0, z: 0, visitedGoals: new Set() };
      const level = { goals: [{ x: 2, y: 0, height: 1 }] };
      expect(checkWinCondition(state, level)).toBe(false);
    });

    it('requires laptop for laptop levels', () => {
      const state = { x: 2, y: 0, z: 0, hasLaptop: false, visitedGoals: new Set() };
      const level = { goals: [{ x: 2, y: 0 }], laptop: { x: 1, y: 0 } };
      expect(checkWinCondition(state, level)).toBe(false);
    });

    it('passes with laptop when required', () => {
      const state = { x: 2, y: 0, z: 0, hasLaptop: true, visitedGoals: new Set() };
      const level = { goals: [{ x: 2, y: 0 }], laptop: { x: 1, y: 0 } };
      expect(checkWinCondition(state, level)).toBe(true);
    });
  });

  describe('multi-goal levels', () => {
    it('returns false when not all goals visited', () => {
      const state = { x: 0, y: 0, z: 0, visitedGoals: new Set(['0,0']) };
      const level = { goals: [{ x: 0, y: 0 }, { x: 2, y: 0 }] };
      expect(checkWinCondition(state, level)).toBe(false);
    });

    it('returns true when all goals visited', () => {
      const state = { x: 2, y: 0, z: 0, visitedGoals: new Set(['0,0', '2,0']) };
      const level = { goals: [{ x: 0, y: 0 }, { x: 2, y: 0 }] };
      expect(checkWinCondition(state, level)).toBe(true);
    });
  });
});

describe('Command Counting', () => {
  it('counts simple commands', () => {
    const actions = [
      { type: 'move', count: 1 },
      { type: 'jump', count: 1 },
      { type: 'spin', direction: 'right' }
    ];
    expect(countCommands(actions)).toBe(3);
  });

  it('counts while loop body minus 1', () => {
    const actions = [
      {
        type: 'while',
        condition: 'hacking',
        body: [
          { type: 'move', count: 1 },
          { type: 'spin', direction: 'right' }
        ]
      }
    ];
    // while loop counts as: inner commands (2) - 1 = 1
    expect(countCommands(actions)).toBe(1);
  });

  it('handles mixed commands and loops', () => {
    const actions = [
      { type: 'move', count: 1 },
      {
        type: 'while',
        condition: 'hacking',
        body: [{ type: 'move', count: 1 }]
      }
    ];
    // 1 + (1 - 1) = 1
    expect(countCommands(actions)).toBe(1);
  });
});

describe('Scoring', () => {
  it('calculates 950 for 1 command', () => {
    expect(calculateScore(1)).toBe(950);
  });

  it('calculates 900 for 2 commands', () => {
    expect(calculateScore(2)).toBe(900);
  });

  it('has minimum score of 100', () => {
    expect(calculateScore(100)).toBe(100);
  });

  it('calculates correctly for typical plays', () => {
    expect(calculateScore(3)).toBe(850);
    expect(calculateScore(5)).toBe(750);
    expect(calculateScore(10)).toBe(500);
  });
});
