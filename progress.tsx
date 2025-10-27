import React from 'react';
import { cn } from '../../utils/cn';

const Progress = React.forwardRef<HTMLDivElement, { value: number; className?: string }>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('relative h-2 w-full overflow-hidden rounded-full bg-white/20', className)}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-gradient-to-r from-cyan-400 to-purple-500 transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
));

export { Progress };