// components/Platter.tsx
import React, { useRef, useState, useCallback } from 'react';
import { cn } from '../utils/cn';
import * as Icons from './Icons';

interface PlatterProps {
  isPlaying: boolean;
  rate: number;
  albumArtUrl: string | null;
  deckColor: string;
  isLoading: boolean;
  onScratchStart?: () => void;
  onScratchEnd?: () => void;
  onScratch?: (angleDelta: number) => void;
}

const Platter: React.FC<PlatterProps> = ({
  isPlaying,
  rate,
  albumArtUrl,
  deckColor,
  isLoading,
  onScratchStart,
  onScratchEnd,
  onScratch,
}) => {
  const platterRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastAngle = useRef(0);
  const rotationRef = useRef(0);

  const getAngle = (e: MouseEvent | React.MouseEvent) => {
    if (!platterRef.current) return 0;
    const rect = platterRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const currentAngle = getAngle(e);
    let angleDelta = currentAngle - lastAngle.current;
    
    // Handle wrapping around 360 degrees
    if (angleDelta > 180) angleDelta -= 360;
    if (angleDelta < -180) angleDelta += 360;

    rotationRef.current += angleDelta;
    if(platterRef.current) {
        platterRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
    }
    onScratch?.(angleDelta);
    lastAngle.current = currentAngle;
  }, [onScratch]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    onScratchEnd?.();
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, onScratchEnd]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLoading) return;
    setIsDragging(true);
    onScratchStart?.();
    lastAngle.current = getAngle(e);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const animationStyle: React.CSSProperties = isPlaying && !isDragging
    ? { animation: `spin ${60 / (120 * rate)}s linear infinite` }
    : {};

  return (
    <div className="w-full h-full relative" onMouseDown={handleMouseDown}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      
      {/* Platter Base */}
      <div className="w-full h-full rounded-full bg-slate-800 shadow-inner p-2">
        {/* Spinning record */}
        <div
          ref={platterRef}
          className="w-full h-full rounded-full bg-black flex items-center justify-center"
          style={animationStyle}
        >
          {/* Concentric Rings */}
          <div className="absolute inset-4 rounded-full border border-slate-700/50" />
          <div className="absolute inset-8 rounded-full border-2 border-slate-800" />
          <div className="absolute inset-12 rounded-full border border-slate-700/50" />
          
          {/* Center spindle */}
          <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-600 relative">
             <div className={cn("absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full", isPlaying && !isDragging && 'animate-pulse')} style={{backgroundColor: deckColor}} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Platter;
