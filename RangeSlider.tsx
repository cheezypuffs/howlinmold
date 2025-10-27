import React, { useCallback, useEffect, useState, useRef } from 'react';
import { cn } from '../../utils/cn';

interface RangeSliderProps {
  className?: string;
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onValueChange: (newValue: [number, number]) => void;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  className,
  min,
  max,
  step,
  value,
  onValueChange,
}) => {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const minValRef = useRef(value[0]);
  const maxValRef = useRef(value[1]);
  const range = useRef<HTMLDivElement>(null);
  
  // Convert value to percentage
  const getPercent = useCallback((val: number) => Math.round(((val - min) / (max - min)) * 100), [min, max]);

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);
  
  // Update parent component state
  useEffect(() => {
    minValRef.current = value[0];
    maxValRef.current = value[1];
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value]);
  
  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(event.target.value), maxVal - step);
    setMinVal(value);
    minValRef.current = value;
    onValueChange([value, maxVal]);
  };
  
  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(event.target.value), minVal + step);
    setMaxVal(value);
    maxValRef.current = value;
    onValueChange([minVal, value]);
  };

  return (
    <div className={cn("relative h-10 flex items-center", className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={handleMinChange}
        className="thumb thumb--left"
        style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
        aria-label="Minimum year"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={handleMaxChange}
        className="thumb thumb--right"
        aria-label="Maximum year"
      />

      <div className="relative w-full">
        <div className="absolute h-1.5 rounded-full bg-black/50 w-full z-10" />
        <div ref={range} className="absolute h-1.5 rounded-full bg-cyan-400 z-20" />
      </div>
       <style>{`
        .thumb {
          pointer-events: none;
          position: absolute;
          height: 0;
          width: 100%;
          outline: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
           background-color: transparent;
        }
        
        .thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          pointer-events: all;
          width: 16px;
          height: 16px;
          background-color: #f1f5f9;
          border-radius: 50%;
          border: 2px solid #475569;
          cursor: pointer;
          margin-top: -7px;
          position: relative;
          z-index: 10;
        }
        
        .thumb::-moz-range-thumb {
          pointer-events: all;
          width: 16px;
          height: 16px;
          background-color: #f1f5f9;
          border-radius: 50%;
          border: 2px solid #475569;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};