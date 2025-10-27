import React from 'react';
import { cn } from '../../utils/cn';
import * as Icons from '../Icons';
import { motion, AnimatePresence } from '../motion';

interface CheckboxProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  id?: string;
  disabled?: boolean;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked, onCheckedChange, className, id, disabled, ...props }, ref) => {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => !disabled && onCheckedChange(!checked)}
        id={id}
        ref={ref}
        disabled={disabled}
        className={cn(
          'peer h-4 w-4 shrink-0 rounded-sm border border-white/30 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-cyan-400 border-cyan-400' : 'bg-white/10',
          className
        )}
        {...props}
      >
        <AnimatePresence>
            {checked && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    
                    transition={{ duration: 0.1 }}
                    className="flex items-center justify-center h-full"
                >
                    <Icons.Check className="h-3 w-3 text-black" />
                </motion.div>
            )}
        </AnimatePresence>
      </button>
    );
  }
);

export { Checkbox };