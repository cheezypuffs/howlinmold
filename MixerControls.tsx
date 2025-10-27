// components/deck/MixerControls.tsx
import React from 'react';
import type { DeckId, DeckState, Action } from '../../types';
import RotaryKnob from '../RotaryKnob';

interface MixerControlsProps {
    deckId: DeckId;
    deckState: DeckState;
    dispatch: React.Dispatch<Action>;
    deckColor: string;
}

const MixerControls: React.FC<MixerControlsProps> = ({ deckId, deckState, dispatch, deckColor }) => {
    const { filter } = deckState;

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-2 bg-black/20 rounded-lg h-full">
            <RotaryKnob
                label="FILTER"
                value={filter}
                onChange={(v) => dispatch({ type: 'SET_DECK_VALUE', deckId, key: 'filter', value: v })}
                min={-1}
                max={1}
                defaultValue={0}
                size="large"
                glowColor={deckColor}
            />
        </div>
    );
};

export default MixerControls;