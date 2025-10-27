// components/ui/StaticWaveform.tsx
import React from 'react';

interface StaticWaveformProps {
  peaks: number[]; // Expects an array of alternating min/max values [min, max, min, max, ...]
  color?: string;
  className?: string;
  height?: number;
}

export const StaticWaveform: React.FC<StaticWaveformProps> = ({
  peaks,
  color = '#4cc9f0', // Default to cyan
  className = '',
  height = 60,
}) => {
  const width = peaks.length / 2;
  const centerY = height / 2;

  return (
    <svg
      className={className}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <g>
        {peaks.map((peak, i) => {
          if (i % 2 !== 0) return null; // Only process pairs (min, max)

          const x = i / 2;
          const yMin = centerY + (peaks[i] * centerY);
          const yMax = centerY + (peaks[i + 1] * centerY);
          
          return (
            <rect
              key={i}
              x={x}
              y={yMin}
              width={1}
              height={Math.max(1, yMax - yMin)}
              fill={color}
            />
          );
        })}
      </g>
    </svg>
  );
};
