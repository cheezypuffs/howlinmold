import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// FIX: Corrected import paths to be relative
import Library from '../../components/Library';
// FIX: Corrected import paths to be relative
import { initialState } from '../../state/reducer';
import type { SpotifyTrackData } from '../../types';

const mockLibrary: SpotifyTrackData[] = [
  {
    id: '1',
    name: 'Cosmic Track One',
    artists: [{ name: 'Artist Alpha' }],
    album: { name: 'Album Alpha', images: [], release_date: '2023-01-01', artists: [] },
    duration_ms: 180000,
    // Add other required properties from SpotifyTrackData
  } as SpotifyTrackData,
  {
    id: '2',
    name: 'Galaxy Song Two',
    artists: [{ name: 'Artist Beta' }],
    album: { name: 'Album Beta', images: [], release_date: '2023-01-01', artists: [] },
    duration_ms: 200000,
  } as SpotifyTrackData,
];

describe('Library Component', () => {
  const mockProps = {
    appState: { ...initialState, library: mockLibrary },
    loadTrack: vi.fn(),
    user: null,
    setActiveView: vi.fn(),
    libraryVersion: 1,
    globalSearchTerm: '',
  };

  it('filters tracks by search term using CosmicSearchBar', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Library {...mockProps} />);
    
    // Check that both tracks are initially visible
    expect(screen.getByText('Cosmic Track One')).toBeInTheDocument();
    expect(screen.getByText('Galaxy Song Two')).toBeInTheDocument();

    // Simulate typing in the global search bar by re-rendering with a new prop
    rerender(<Library {...mockProps} globalSearchTerm="Cosmic" />);
    
    // Check that only the matching track is visible
    expect(screen.getByText('Cosmic Track One')).toBeInTheDocument();
    expect(screen.queryByText('Galaxy Song Two')).not.toBeInTheDocument();
  });
});
