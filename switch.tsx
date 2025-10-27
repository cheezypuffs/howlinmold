// FIX: Added React import to solve JSX errors.
import React from 'react';
import { cn } from '../../utils/cn';

const Switch = React.forwardRef<
  HTMLButtonElement,
  {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    className?: string;
    id?: string;
    disabled?: boolean;
  }
>(({ checked, onCheckedChange, className, id, disabled, ...props }, ref) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onCheckedChange(!checked)}
      id={id}
      ref={ref}
      disabled={disabled}
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-purple-600' : 'bg-gray-600',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
});

export { Switch };