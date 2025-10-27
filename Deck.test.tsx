import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Deck from '../../components/Deck';
// FIX: Corrected import paths to be relative
import type { DeckId, DeckState, AppState } from '../../types';
import { initialState, initialDeckState } from '../../state/reducer';

const mockState: DeckState = {
  ...initialDeckState,
  title: 'Test Track',
  artist: 'Test Artist',
  duration: 180,
  bpm: 128,
  key: 'Am',
  playing: false,
  loaded: true,
};

describe('Deck Component', () => {
  const mockProps = {
    deckId: 'A' as DeckId,
    state: mockState,
    appState: initialState,
    dispatch: vi.fn(),
    engine: { current: null },
    loadTrack: vi.fn(),
    onCreatePost: vi.fn(),
  };

  it('renders track information', () => {
    render(<Deck {...mockProps} />);
    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByText('128.0 BPM')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    const loadingState = { ...mockState, isLoading: true, loadingMessage: 'Loading...' };
    render(<Deck {...mockProps} state={loadingState} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('toggles play on play button click', async () => {
    render(<Deck {...mockProps} />);
    const playButton = screen.getByRole('button', { name: /play/i });
    await userEvent.click(playButton);
    expect(mockProps.dispatch).toHaveBeenCalledWith({
      type: 'TOGGLE_PLAY',
      deckId: 'A',
    });
  });

  it('shows MASTER badge when it is the master deck', () => {
    const masterAppState = { ...initialState, masterDeck: 'A' as DeckId };
    render(<Deck {...mockProps} appState={masterAppState} />);
    expect(screen.getByText('MASTER')).toBeInTheDocument();
  });
  
  it('does not show MASTER badge when it is not the master deck', () => {
    const masterAppState = { ...initialState, masterDeck: 'B' as DeckId };
    render(<Deck {...mockProps} appState={masterAppState} />);
    expect(screen.queryByText('MASTER')).not.toBeInTheDocument();
  });
});
