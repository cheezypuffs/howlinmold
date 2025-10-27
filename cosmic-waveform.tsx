import React, { useEffect, useRef, useState } from 'react';
import { motion } from '../motion';

interface MiniWaveformProps {
  audioData?: number[]; // Array of normalized frequency data (0-1)
  color?: 'gold' | 'cyan' | 'pink' | 'orange';
  height?: number;
  bars?: number;
  isActive?: boolean;
}

export const MiniWaveform: React.FC<MiniWaveformProps> = ({
  audioData,
  color = 'gold',
  height = 40,
  bars = 30,
  isActive = true
}) => {
  const [displayData, setDisplayData] = useState<number[]>(new Array(bars).fill(0));

  useEffect(() => {
    if (!audioData || audioData.length === 0) {
      // Animate to zero when no audio
      setDisplayData(prev => prev.map(val => Math.max(0, val * 0.9)));
      return;
    }

    // Smooth the incoming data
    const smoothed = audioData.slice(0, bars).map((val, index) => {
      const current = displayData[index] || 0;
      return current + (val - current) * 0.3; // Smoothing factor
    });

    setDisplayData(smoothed);
  }, [audioData, bars, displayData]);

  const colors = {
    gold: 'var(--hm-gold)',
    cyan: 'var(--hm-cyan)',
    pink: 'var(--cosmic-accent-pink)',
    orange: 'var(--cosmic-warm-orange)'
  };

  const activeColor = colors[color];

  return (
    <div 
      className="flex items-center justify-center gap-0.5 px-2"
      style={{ height: `${height}px` }}
    >
      {displayData.map((amplitude, index) => {
        const normalizedAmp = Math.max(0, Math.min(1, amplitude));
        const barHeight = normalizedAmp * height * 0.8;

        return (
          <motion.div
            key={index}
            className="flex-1 rounded-sm"
            style={{
              background: isActive
                ? `linear-gradient(180deg, ${activeColor}, ${activeColor}00)`
                : 'rgba(214, 181, 93, 0.2)',
              boxShadow: isActive && normalizedAmp > 0.5
                ? `0 0 ${normalizedAmp * 8}px ${activeColor}`
                : 'none',
              minHeight: '2px'
            }}
            animate={{
              height: `${barHeight}px`,
            }}
            transition={{
              duration: 0.05,
              ease: 'easeOut'
            }}
          />
        );
      })}
    </div>
  );
};

// Bar waveform variant
export const BarWaveform: React.FC<MiniWaveformProps & { width?: number }> = ({
  audioData,
  color = 'gold',
  height = 60,
  bars = 40,
  width = 200,
  isActive = true
}) => {
  const [displayData, setDisplayData] = useState<number[]>(new Array(bars).fill(0));

  useEffect(() => {
    if (!audioData || audioData.length === 0) {
      setDisplayData(prev => prev.map(val => Math.max(0, val * 0.95)));
      return;
    }

    const smoothed = audioData.slice(0, bars).map((val, index) => {
      const current = displayData[index] || 0;
      return current + (val - current) * 0.4;
    });

    setDisplayData(smoothed);
  }, [audioData, bars, displayData]);

  const colors = {
    gold: 'var(--hm-gold)',
    cyan: 'var(--hm-cyan)',
    pink: 'var(--cosmic-accent-pink)',
    orange: 'var(--cosmic-warm-orange)'
  };

  const activeColor = colors[color];
  const barWidth = width / bars;

  return (
    <div 
      className="flex items-end justify-center gap-0.5"
      style={{ 
        height: `${height}px`,
        width: `${width}px`
      }}
    >
      {displayData.map((amplitude, index) => {
        const normalizedAmp = Math.max(0, Math.min(1, amplitude));
        const barHeight = normalizedAmp * height * 0.7;

        return (
          <motion.div
            key={index}
            className="rounded-sm"
            style={{
              width: `${barWidth - 1}px`,
              background: isActive
                ? `linear-gradient(180deg, ${activeColor}, ${activeColor}66)`
                : 'rgba(214, 181, 93, 0.15)',
              boxShadow: isActive && normalizedAmp > 0.3
                ? `0 0 ${normalizedAmp * 12}px ${activeColor}60`
                : 'none',
              minHeight: '2px'
            }}
            animate={{
              height: `${barHeight}px`,
            }}
            transition={{
              duration: 0.05,
              ease: 'easeOut'
            }}
          />
        );
      })}
    </div>
  );
};
