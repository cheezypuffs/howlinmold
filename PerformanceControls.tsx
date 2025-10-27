import React, { useRef, useCallback, useState, useMemo } from 'react';
import type { DeckState, Action, Effect, AppState, Sigil, SigilParams, Hotcue } from '../types';
import type { Engine } from '../hooks/useAudioEngine';
import { nearestBeatTime } from '../utils/helpers';
import { HOTCUE_COLORS } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../utils/cn';
import { GoogleGenAI, Type } from "@google/genai";
import { useToast } from '../hooks/use-toast';
import { generateSigilAudio, generateSigilVisualPath } from '../utils/sigilGenerator';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader } from './Icons';
import SigilPad from './SigilPad';

interface PerformanceControlsProps {
    id: 'A' | 'B';
    state: DeckState;
    appState: AppState;
    dispatch: React.Dispatch<Action>;
    engine: React.MutableRefObject<Engine | null>;
}

type PadMode = 'HOTCUE' | 'BEATJUMP' | 'LOOPROLL' | 'SIGILS';

const HotcueEditor: React.FC<{
  hotcue: Hotcue;
  onSave: (updates: Partial<Hotcue>) => void;
  onDelete: () => void;
  onClose: () => void;
}> = ({ hotcue, onSave, onDelete, onClose }) => {
  const [name, setName] = useState(hotcue.name);
  const [color, setColor] = useState(hotcue.color);

  const handleSave = () => { onSave({ name, color }); onClose(); };
  const handleDelete = () => { onDelete(); onClose(); };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg p-6 w-80 shadow-lg border border-slate-700" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-xl mb-4 text-white">Edit Hotcue</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400">NAME</label>
            <Input value={name} onChange={e => setName(e.target.value)} className="bg-slate-900 border-slate-600 mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400">COLOR</label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {HOTCUE_COLORS.map(c => (
                <button
                  key={c.value} onClick={() => setColor(c.value)}
                  className={`h-12 rounded-md transition-all duration-150 ${color === c.value ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white' : 'ring-0'}`}
                  style={{ backgroundColor: c.value }} aria-label={`Set color to ${c.name}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-700">
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
};


const PerformanceControls: React.FC<PerformanceControlsProps> = ({ id, state, appState, dispatch, engine }) => {
    const deckColor = id === 'A' ? 'var(--sw-deck-a-color)' : 'var(--sw-deck-b-color)';
    const [padMode, setPadMode] = useState<PadMode>('HOTCUE');
    const [activeJump, setActiveJump] = useState<number | null>(null);
    const [editingHotcue, setEditingHotcue] = useState<Hotcue | null>(null);
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);
    const { toast } = useToast();

    const handleBeatJump = (beats: number) => { /* ... */ };
    const handleLoopRoll = (length: number | null) => { /* ... */ };
    const handleHotCuePress = useCallback(async (index: number, e: React.MouseEvent) => { /* ... */ }, [/* ... */]);
    const handleHotCueContextMenu = (index: number, e: React.MouseEvent) => { /* ... */ };
    const handleSaveHotcue = (updates: Partial<Hotcue>) => { /* ... */ };
    const handleDeleteHotcue = () => { /* ... */ };
    const handleGenerateSigils = useCallback(async () => { /* ... */ }, [/* ... */]);
    const handleLoopIn = useCallback(() => { /* ... */ }, [/* ... */]);
    const handleLoopOut = useCallback(() => { /* ... */ }, [/* ... */]);
    const handleLoopToggle = useCallback(() => { /* ... */ }, [/* ... */]);
    const handleLoopHalf = useCallback(() => { /* ... */ }, [/* ... */]);
    const handleLoopDouble = useCallback(() => { /* ... */ }, [/* ... */]);

    const renderPads = () => {
        const pads = Array.from({ length: 8 }, (_, i) => i);
        switch (padMode) {
            case 'HOTCUE':
                return (
                    <>
                        <div className="grid grid-cols-4 gap-3">
                            {pads.map(i => {
                                const hotcue = state.hotcues[i];
                                const isSet = !!hotcue;
                                return (
                                    <button
                                        key={i}
                                        onClick={(e) => handleHotCuePress(i, e)}
                                        onContextMenu={(e) => handleHotCueContextMenu(i, e)}
                                        disabled={!state.loaded}
                                        className="h-16 rounded-lg text-sm font-bold transition-all duration-150 border active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                                        style={isSet ? {
                                            backgroundColor: `${hotcue.color}40`, // 25% opacity
                                            borderColor: hotcue.color,
                                            color: '#fff',
                                            boxShadow: `0 0 15px ${hotcue.color}99, inset 0 0 10px ${hotcue.color}33`,
                                            textShadow: `0 0 5px #000`
                                        } : {
                                            backgroundColor: 'rgba(10, 10, 20, 0.4)',
                                            borderColor: 'rgba(255, 255, 255, 0.1)',
                                        }}
                                    >
                                        {hotcue ? hotcue.name.substring(0, 4) : ''}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                );

            // Other pad modes remain visually similar for now
            default: return null;
        }
    };

    return (
        <div className="flex flex-col gap-3 p-2 text-white bg-black/20 rounded-lg">
             <div className="flex justify-center bg-black/30 rounded-lg p-1">
                {(['HOTCUE', 'BEATJUMP', 'LOOPROLL', 'SIGILS'] as PadMode[]).map(mode => (
                    <button
                        key={mode}
                        onClick={() => setPadMode(mode)}
                        className={cn("w-full py-1.5 text-xs font-bold rounded-md transition-all duration-200", padMode === mode ? 'bg-white/20 text-white' : 'text-slate-400 hover:bg-white/10')}
                    >
                        {mode}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-5 gap-2">
                <Button onClick={handleLoopHalf} disabled={!state.looping} className="h-8 text-xs bg-slate-700/50 disabled:opacity-50">1/2</Button>
                <Button onClick={handleLoopIn} disabled={!state.loaded} className={cn("h-8 text-xs font-bold disabled:opacity-50", state.pendingLoopStart !== null ? 'bg-cyan-500 text-black animate-pulse' : 'bg-slate-700/50')}>IN</Button>
                <Button onClick={handleLoopToggle} disabled={!state.loaded} className={cn("h-8 text-sm font-bold disabled:opacity-50", state.looping ? 'bg-green-500 text-black' : 'bg-slate-700/50')}>
                    {state.looping ? state.loopLength : 'LOOP'}
                </Button>
                <Button onClick={handleLoopOut} disabled={state.pendingLoopStart === null} className="h-8 text-xs font-bold bg-slate-700/50 disabled:opacity-50">OUT</Button>
                <Button onClick={handleLoopDouble} disabled={!state.looping} className="h-8 text-xs bg-slate-700/50 disabled:opacity-50">2x</Button>
            </div>
            
            <div className="min-h-[148px]">
                {renderPads()}
            </div>
             {editingHotcue && (
                <HotcueEditor hotcue={editingHotcue} onSave={handleSaveHotcue} onDelete={handleDeleteHotcue} onClose={() => setEditingHotcue(null)} />
            )}
        </div>
    );
};

export default PerformanceControls;
