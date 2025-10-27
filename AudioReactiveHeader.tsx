import React, { memo } from 'react';
import type { DeckState } from '../types';

interface AudioReactiveHeaderProps {
  stateA: DeckState;
  stateB: DeckState;
  recorder: { isRecording: boolean };
  socialState: any;
  isMixPartyConnected: boolean;
  collaborativeEnergy: number;
  wsConnectionStatus: string;
  activeView: string;
}

const AudioReactiveHeader: React.FC<AudioReactiveHeaderProps> = memo(({ 
  stateA, 
  stateB, 
  recorder, 
  isMixPartyConnected, 
  collaborativeEnergy
}) => (
  <header className="audio-reactive-header bg-gradient-to-r from-purple-900/20 to-cyan-900/20 p-2 rounded-lg border border-white/10 mb-4">
    <div className="flex items-center gap-4 text-sm text-slate-400">
      <span>Audio Context: {stateA?.loaded || stateB?.loaded ? 'Active' : 'Inactive'}</span>
      {recorder?.isRecording && <span className="text-red-400 flex items-center gap-1.5"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Recording</span>}
      {isMixPartyConnected && <span className="text-green-400">Pack Connected</span>}
      <span>Energy: {Math.round(collaborativeEnergy * 100)}%</span>
    </div>
  </header>
));

export default AudioReactiveHeader;