import React, { useRef, useEffect } from 'react';
import type { DeckState } from '../types';
import { formatTime } from '../utils/helpers';

interface DetailedWaveformProps {
  deckState: DeckState;
  deckColor: string;
}

const DetailedWaveform: React.FC<DetailedWaveformProps> = ({ deckState, deckColor }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const beatsToShow = 16; // How many beats to show on the screen

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const dpr = window.devicePixelRatio || 1;
        const parent = canvas.parentElement;
        if (!parent) return;

        const { clientWidth: width, clientHeight: height } = parent;
        if (width <= 0 || height <= 0) return;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.scale(dpr, dpr);

        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(10, 10, 20, 0.5)';
        ctx.fillRect(0, 0, width, height);
        
        const { waveform, duration, bpm, currentTime, trueCurrentTime, slipMode, grid, hotcues, looping, loopStart, loopEnd } = deckState;

        if (!waveform || !duration || !bpm) {
            ctx.fillStyle = 'rgb(100, 116, 139)';
            ctx.textAlign = 'center';
            ctx.font = '16px sans-serif';
            ctx.fillText('No waveform data', width / 2, height / 2);
            return;
        }

        const beatDuration = 60 / bpm;
        const windowDuration = beatsToShow * beatDuration;
        const windowStart = currentTime - (windowDuration / 2);
        const windowEnd = currentTime + (windowDuration / 2);

        // --- Draw Waveform ---
        ctx.fillStyle = deckColor;
        const peakCount = waveform.length / 2;
        const samplesPerSecond = peakCount / duration;

        for (let x = 0; x < width; x++) {
            const timeAtPixel = windowStart + (x / width) * windowDuration;
            if (timeAtPixel < 0 || timeAtPixel > duration) continue;

            const i = Math.floor(timeAtPixel * samplesPerSecond);
            if (i * 2 + 1 >= waveform.length) continue;

            const yMin = (waveform[i * 2] * height / 2);
            const yMax = (waveform[i * 2 + 1] * height / 2);

            ctx.fillRect(x, (height / 2) + yMin, 1, Math.max(1, yMax - yMin));
        }

        // --- Draw Beat Grid ---
        if (grid) {
            grid.forEach((beatTime, index) => {
                if (beatTime >= windowStart && beatTime <= windowEnd) {
                    const x = ((beatTime - windowStart) / windowDuration) * width;
                    const isDownbeat = index % 4 === 0;
                    ctx.strokeStyle = `rgba(255, 255, 255, ${isDownbeat ? 0.7 : 0.3})`;
                    ctx.lineWidth = isDownbeat ? 2 : 1;
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                    ctx.stroke();
                }
            });
        }
        
        // --- Draw Loop Region ---
        if (looping) {
            const loopStartX = ((loopStart - windowStart) / windowDuration) * width;
            const loopEndX = ((loopEnd - windowStart) / windowDuration) * width;
            if(loopEndX > 0 && loopStartX < width) {
                ctx.fillStyle = `${deckColor}40`; // 25% opacity
                ctx.fillRect(loopStartX, 0, loopEndX - loopStartX, height);
                ctx.strokeStyle = deckColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(loopStartX - 1, 0, (loopEndX - loopStartX) + 2, height);
            }
        }
        
        // --- Draw Hotcues ---
        if (hotcues) {
            hotcues.forEach(hotcue => {
                if (hotcue.time >= windowStart && hotcue.time <= windowEnd) {
                    const x = ((hotcue.time - windowStart) / windowDuration) * width;
                    ctx.fillStyle = hotcue.color;
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x - 8, 16);
                    ctx.lineTo(x + 8, 16);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = 'black';
                    ctx.font = 'bold 10px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(hotcue.name.substring(0, 1), x, 12);
                }
            });
        }


        // --- Draw Center Playhead ---
        const centerX = width / 2;

        // Draw Ghost Playhead for Slip Mode
        if (slipMode) {
            const trueWindowStart = trueCurrentTime - (windowDuration / 2);
            const timeDifference = windowStart - trueWindowStart;
            const trueX = centerX - (timeDifference / windowDuration) * width;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(trueX - 1, 0, 2, height);
        }

        // Draw Main Playhead
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(centerX - 1, 0, 2, height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(formatTime(currentTime), centerX, 12);


    }, [deckState, deckColor, beatsToShow]);

    return (
        <div className="w-full h-full min-h-[400px] bg-black/20 rounded-lg">
            <canvas ref={canvasRef} className="w-full h-full"></canvas>
        </div>
    );
};

export default DetailedWaveform;