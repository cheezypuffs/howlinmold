// components/RotaryKnob.tsx
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { clamp } from '../utils/helpers';
import { cn } from '../utils/cn';

interface RotaryKnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  defaultValue?: number;
  size?: 'small' | 'medium' | 'large';
  displayValueOverride?: string;
  disabled?: boolean;
  glowColor?: string;
}

const RotaryKnob: React.FC<RotaryKnobProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  defaultValue = 0.5,
  size = 'medium',
  displayValueOverride,
  disabled = false,
  glowColor,
}) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);

  const sizeConfig = {
    small: { dim: 40, indicator: 10 },
    medium: { dim: 56, indicator: 14 },
    large: { dim: 80, indicator: 20 },
  };
  const { dim, indicator } = sizeConfig[size];
  const angleRange = 270;

  const valueToAngle = (val: number) => {
    const ratio = (val - min) / (max - min);
    return ratio * angleRange - angleRange / 2 - 45;
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const sensitivity = 200;
    const deltaY = e.movementY;
    const newValue = clamp(displayValue - (deltaY / sensitivity) * (max - min), min, max);
    setDisplayValue(newValue);
    onChange(newValue);
  }, [displayValue, min, max, onChange]);

  const handleMouseUp = useCallback(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    setIsDragging(false);
  }, [handleMouseMove]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    if (e.detail === 2) {
      onChange(defaultValue);
      setDisplayValue(defaultValue);
      return;
    }
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  useEffect(() => {
    if (!isDragging) {
      setDisplayValue(value);
    }
  }, [value, isDragging]);

  const angle = valueToAngle(displayValue);

  return (
    <div className={cn("flex flex-col items-center gap-1", disabled && 'opacity-50 cursor-not-allowed')}>
      <div
        ref={knobRef}
        onMouseDown={handleMouseDown}
        className="relative cursor-ns-resize select-none bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center"
        style={{ width: dim, height: dim }}
        title={`${label}: ${displayValueOverride ?? displayValue.toFixed(2)}`}
      >
        <div
          className="h-1/2 w-0.5 rounded-full absolute top-0 left-1/2 -translate-x-1/2 origin-bottom"
          style={{ transform: `rotate(${angle}deg)` }}
        >
            <div className="w-full h-full bg-slate-400 relative">
                 <div className="absolute -top-px -left-px w-1 h-1 rounded-full" style={{backgroundColor: glowColor || 'var(--color-accent-pink)', boxShadow: `0 0 5px ${glowColor || 'var(--color-accent-pink)'}`}}/>
            </div>
        </div>
      </div>
      <span className="text-[10px] font-semibold tracking-wider text-slate-400">{label}</span>
    </div>
  );
};

export default RotaryKnob;