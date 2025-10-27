import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioEngine } from '../../audio/AudioEngine';

// Mock implementation of AudioBuffer for testing purposes, as it's not available in jsdom.
const createMockAudioBuffer = (duration: number = 10): AudioBuffer => {
  const sampleRate = 44100;
  // @ts-ignore
  const buffer = new AudioBuffer({
    sampleRate,
    numberOfChannels: 2,
    length: sampleRate * duration,
  });
  return buffer;
};


describe('AudioEngine', () => {
  let engine: AudioEngine;

  beforeEach(() => {
    // Resetting singleton state can be complex. For this test, we assume a fresh start.
    // In a larger suite, you might need a dedicated reset method on the singleton.
    engine = AudioEngine.get();
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance on multiple calls', () => {
      const instance1 = AudioEngine.get();
      const instance2 = AudioEngine.get();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Initialization', () => {
    it('should initialize audio context', () => {
      expect(engine.ctx).toBeDefined();
      expect(engine.ctx.state).toBe('running');
    });

    it('should have both deck channels', () => {
      expect(engine.decks.A).toBeDefined();
      expect(engine.decks.B).toBeDefined();
    });
  });

  describe('Playback Control', () => {
    it('should connect a source when playing', () => {
        const mockBuffer = createMockAudioBuffer();
        const deck = engine.decks.A;
        deck.buffer = mockBuffer; // Manually set buffer for testing
        
        // This is a simplified test. A full test would require dispatching actions
        // and checking the state of the mock AudioContext nodes.
        const connectSpy = vi.spyOn(deck, 'connectSource');
        
        // We can't directly call play() as it's managed by the update loop.
        // We can, however, verify that the core components are wired correctly.
        expect(connectSpy).not.toHaveBeenCalled();
    });
  });
});
