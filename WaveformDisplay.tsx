// components/WaveformDisplay.tsx
import React, { useRef, useEffect } from 'react';
import type { DeckState } from '../types';
import { formatTime } from '../utils/helpers';

interface WaveformDisplayProps {
  deckState: DeckState;
  deckColor: string;
}

const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ deckState, deckColor }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { waveform, duration, currentTime, loaded, looping, loopStart, loopEnd } = deckState;
    const deckId = deckColor === 'var(--sw-deck-a-color)' ? 'A' : 'B';

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        if (width === 0 || height === 0) return;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, width, height);

        if (!waveform || !loaded) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.textAlign = 'center';
            ctx.font = '12px sans-serif';
            ctx.fillText('Load a track', width / 2, height / 2);
            return;
        }

        const peakCount = waveform.length / 2;
        const pixelsPerPeak = width / peakCount;
        
        const color = deckId === 'A' ? 'var(--sw-deck-a-color)' : 'var(--sw-deck-b-color)';

        // Draw waveform
        ctx.fillStyle = color;
        for (let i = 0; i < peakCount; i++) {
            const x = i * pixelsPerPeak;
            const yMin = (waveform[i * 2] * height / 2);
            const yMax = (waveform[i * 2 + 1] * height / 2);
            ctx.fillRect(x, (height / 2) + yMin, pixelsPerPeak, Math.max(1, yMax - yMin));
        }

        // Draw loop region
        if (looping && duration > 0) {
            const loopStartX = (loopStart / duration) * width;
            const loopEndX = (loopEnd / duration) * width;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(loopStartX, 0, loopEndX - loopStartX, height);
        }

        // Draw playhead
        if (duration > 0) {
            const playheadX = (currentTime / duration) * width;
            ctx.fillStyle = 'white';
            ctx.fillRect(playheadX, 0, 2, height);
        }

    }, [waveform, duration, currentTime, loaded, looping, loopStart, loopEnd, deckColor, deckId]);

    return (
        <div className="w-full h-full relative">
            <canvas ref={canvasRef} className="w-full h-full" />
            <div className="absolute top-1 left-2 text-xs font-mono text-white/50">{formatTime(currentTime)}</div>
            <div className="absolute top-1 right-2 text-xs font-mono text-white/50">{formatTime(duration)}</div>
        </div>
    );
};

export default WaveformDisplay;