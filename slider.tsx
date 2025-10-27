import React from 'react';
import { cn } from '../../utils/cn';

const Slider = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
    value: number[];
    onValueChange: (value: number[]) => void;
  }
>(({ className, value, onValueChange, ...props }, ref) => {
  // This component will be a simple range input for now to avoid complex dependencies
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    if (value.length > 1) {
      // Find which thumb is closer to the new value and update it.
      const dist1 = Math.abs(value[0] - newValue);
      const dist2 = Math.abs(value[1] - newValue);
      if (dist1 < dist2) {
        onValueChange([newValue, value[1]]);
      } else {
        onValueChange([value[0], newValue]);
      }
    } else {
      onValueChange([newValue]);
    }
  };

  return (
    <input
      type="range"
      value={value ? value[0] : ''}
      onChange={handleChange}
      ref={ref}
      className={cn(
        'w-full h-2 bg-purple-900/50 rounded-lg appearance-none cursor-pointer accent-cyan-400',
        className
      )}
      {...props}
    />
  );
});

export { Slider };