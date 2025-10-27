import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';

interface SynthKeyboardProps {
  onNoteOn: (midiNote: number) => void;
  onNoteOff: (midiNote: number) => void;
  activeNotes: Set<number>;
  octave: number;
  onOctaveChange: (change: number) => void;
  numOctaves?: number;
}

const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const KEY_MAP: { [key: string]: number } = {
    // White keys - bottom row
    'a': 0, 's': 2, 'd': 4, 'f': 5, 'g': 7, 'h': 9, 'j': 11,
    'k': 12, 'l': 14, ';': 16,
    // Black keys - top row
    'w': 1, 'e': 3, 't': 6, 'y': 8, 'u': 10,
    'o': 13, 'p': 15,
};


const isBlackKey = (midiNote: number) => {
    const noteIndex = midiNote % 12;
    return notes[noteIndex].includes('#');
};

const SynthKeyboard: React.FC<SynthKeyboardProps> = ({
  onNoteOn,
  onNoteOff,
  activeNotes,
  octave,
  onOctaveChange,
  numOctaves = 2,
}) => {
  const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set());

  const startNote = useMemo(() => 12 * (octave + 1), [octave]);
  const endNote = useMemo(() => startNote + 12 * numOctaves, [startNote, numOctaves]);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      // Prevent synth from playing when user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
      }
      
      const key = e.key.toLowerCase();

      if (key === 'z') onOctaveChange(-1);
      else if (key === 'x') onOctaveChange(1);
      else if (KEY_MAP[key] !== undefined) {
          const midiNote = startNote + KEY_MAP[key];
          if(midiNote <= endNote && !pressedKeys.has(midiNote)) {
              onNoteOn(midiNote);
              setPressedKeys(prev => new Set(prev).add(midiNote));
          }
      }
  }, [startNote, endNote, onNoteOn, onOctaveChange, pressedKeys]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (KEY_MAP[key] !== undefined) {
          const midiNote = startNote + KEY_MAP[key];
           if(midiNote <= endNote) {
              onNoteOff(midiNote);
              setPressedKeys(prev => {
                const newSet = new Set(prev);
                newSet.delete(midiNote);
                return newSet;
              });
          }
      }
  }, [startNote, endNote, onNoteOff]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);


  const handleMouseDown = (midiNote: number) => {
    setPressedKeys(prev => new Set(prev).add(midiNote));
    onNoteOn(midiNote);
  };

  const handleMouseUp = (midiNote: number) => {
    setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(midiNote);
        return newSet;
    });
    onNoteOff(midiNote);
  };
  
  const handleMouseEnter = (midiNote: number, e: React.MouseEvent) => {
      // Check if primary mouse button is pressed
      if(e.buttons === 1) {
          handleMouseDown(midiNote);
      }
  };

  const handleMouseLeave = (midiNote: number) => {
      if (pressedKeys.has(midiNote)) {
          handleMouseUp(midiNote);
      }
  };


  const renderKeys = () => {
    const keys = [];
    const whiteKeys = [];
    const blackKeys = [];

    for (let i = startNote; i <= endNote; i++) {
        keys.push({ midi: i, isBlack: isBlackKey(i) });
    }

    let whiteKeyIndex = 0;
    for (const key of keys) {
      const { midi, isBlack } = key;
      const isActive = activeNotes.has(midi) || pressedKeys.has(midi);

      if (!isBlack) {
        whiteKeys.push(
          <div
            key={midi}
            onMouseDown={() => handleMouseDown(midi)}
            onMouseUp={() => handleMouseUp(midi)}
            onMouseEnter={(e) => handleMouseEnter(midi, e)}
            onMouseLeave={() => handleMouseLeave(midi)}
            className={cn(
                'absolute h-full border-r border-slate-600 bg-gradient-to-b from-slate-100 to-slate-300 rounded-b-md transition-all duration-75 active:bg-purple-300',
                isActive && 'bg-gradient-to-b from-purple-400 to-purple-500 shadow-inner shadow-black/20 border-purple-600'
            )}
            style={{
              left: `${whiteKeyIndex * (100 / (keys.filter(k => !k.isBlack).length -1))}%`,
              width: `${100 / (keys.filter(k => !k.isBlack).length -1)}%`
            }}
          />
        );
        whiteKeyIndex++;
      }
    }

    whiteKeyIndex = 0;
    for (const key of keys) {
        const { midi, isBlack } = key;
        const isActive = activeNotes.has(midi) || pressedKeys.has(midi);

        if (!isBlack) {
            whiteKeyIndex++;
            continue;
        }
        
        blackKeys.push(
            <div
                key={midi}
                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(midi); }}
                onMouseUp={(e) => { e.stopPropagation(); handleMouseUp(midi); }}
                onMouseEnter={(e) => { e.stopPropagation(); handleMouseEnter(midi, e); }}
                onMouseLeave={(e) => { e.stopPropagation(); handleMouseLeave(midi); }}
                className={cn(
                    'absolute h-2/3 w-[1.5%] border border-black bg-gradient-to-b from-slate-800 to-black rounded-b-md z-10 transition-all duration-75 active:bg-purple-700',
                     isActive && 'bg-gradient-to-b from-purple-500 to-purple-700 border-purple-400'
                )}
                style={{
                  left: `${(whiteKeyIndex - 0.75) * (100 / (keys.filter(k => !k.isBlack).length -1))}%`,
                  width: `${(100 / (keys.filter(k => !k.isBlack).length -1)) * 0.5}%`
                }}
            />
        );
    }

    return (
        <div className="relative w-full h-full">
            {whiteKeys}
            {blackKeys}
        </div>
    );
  };
  
  return (
    <div className="flex flex-col gap-2 p-4 bg-neutral-900/50 rounded-lg">
      <div className="flex items-center justify-between px-2">
        <span className="text-sm font-mono text-slate-400">Octave: {octave}</span>
        <div className="flex gap-2">
          <Button onClick={() => onOctaveChange(-1)} size="sm" variant="outline" className="text-white border-white/20">- (Z)</Button>
          <Button onClick={() => onOctaveChange(1)} size="sm" variant="outline" className="text-white border-white/20">+ (X)</Button>
        </div>
      </div>
      <div className="w-full h-36 relative select-none">
          {renderKeys()}
      </div>
    </div>
  );
};

export default SynthKeyboard;