import React from 'react';
import RotaryKnob from '../RotaryKnob';
import { Button } from '../ui/button';
import * as Icons from '../Icons';
import useBeatSequencer from '../../hooks/useBeatSequencer';
import { cn } from '../../utils/cn';

const GlassCard = React.forwardRef<
    HTMLDivElement,
    { children: React.ReactNode; className?: string; } & React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => (
    <div ref={ref} className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg ${className}`} {...props}>
        {children}
    </div>
));
GlassCard.displayName = "GlassCard";

const instrumentLabels = [
    { name: "Kick", color: "bg-red-500" },
    { name: "Snare", color: "bg-yellow-500" },
    { name: "Hi-Hat", color: "bg-cyan-500" }
];

interface BeatSequencerProps {
    initializeEngine: () => void;
}

const BeatSequencer: React.FC<BeatSequencerProps> = ({ initializeEngine }) => {
    const { pattern, toggleStep, isPlaying, togglePlayPause, bpm, setBpm, currentStep } = useBeatSequencer();

    const handlePlayClick = () => {
        initializeEngine();
        togglePlayPause();
    }

    return (
        <GlassCard className="p-4 flex flex-col lg:flex-row gap-4">
            <div className="flex flex-col items-center gap-4">
                <h3 className="text-center font-bold text-green-300 tracking-widest">BEAT SEQUENCER</h3>
                <Button onClick={handlePlayClick} variant="outline" size="lg" className="w-24 h-12 text-lg">
                    {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                </Button>
                <RotaryKnob 
                    label="BPM" 
                    value={bpm} 
                    onChange={setBpm} 
                    min={60} 
                    max={200} 
                    defaultValue={120} 
                    displayValueOverride={`${bpm.toFixed(0)}`}
                    glowColor="#6ee7b7"
                />
            </div>
            <div className="flex-grow grid grid-cols-16 gap-1">
                {pattern.map((instrumentRow, i) => (
                    <React.Fragment key={i}>
                        {instrumentRow.map((step, j) => (
                            <button
                                key={`${i}-${j}`}
                                onClick={() => toggleStep(i, j)}
                                className={cn(
                                    "w-full aspect-square rounded-md transition-all duration-100 border",
                                    step ? `${instrumentLabels[i].color} border-slate-400 shadow-md` : "bg-slate-700/50 border-slate-600 hover:bg-slate-600/50",
                                    currentStep === j && isPlaying && "ring-2 ring-offset-2 ring-offset-black ring-white"
                                )}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </GlassCard>
    );
};

export default BeatSequencer;
