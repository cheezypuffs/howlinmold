import { describe, it, expect } from 'vitest';
import { reducer, initialState } from '../../state/reducer';
import type { AnyDeckId } from '../../types';

describe('App Reducer', () => {
  describe('TOGGLE_PLAY action', () => {
    it('should start playback when not playing', () => {
      const action = { type: 'TOGGLE_PLAY', deckId: 'A' } as const;
      const newState = reducer(initialState, action);
      expect(newState.A.playing).toBe(true);
    });

    it('should stop playback when playing', () => {
      const stateWithPlayingDeck = { ...initialState, A: { ...initialState.A, playing: true } };
      const action = { type: 'TOGGLE_PLAY', deckId: 'A' } as const;
      const newState = reducer(stateWithPlayingDeck, action);
      expect(newState.A.playing).toBe(false);
    });
  });

  describe('SET_RATE action', () => {
    it('should update playback rate', () => {
      const action = { type: 'SET_RATE', deckId: 'A', rate: 1.2 } as const;
      const newState = reducer(initialState, action);
      expect(newState.A.rate).toBe(1.2);
    });

    // This test is based on the TESTING.md spec. It will fail with the current
    // reducer implementation, demonstrating the value of the test. To make it
    // pass, clamping logic should be added to the 'SET_RATE' case in the reducer.
    it('should clamp rate to valid range (speculative test)', () => {
      const action = { type: 'SET_RATE', deckId: 'A', rate: 5.0 } as const; // Invalid rate per spec
      const newState = reducer(initialState, action);
      // Assuming a max rate of 4, this test expects the reducer to clamp the value.
      // The current reducer does not, so this test would fail and indicate a needed change.
      expect(newState.A.rate).toBeLessThanOrEqual(4.0);
    });
  });
});
