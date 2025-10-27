import React from 'react';
import { cn } from '../../utils/cn';

const Badge: React.FC<{ children: React.ReactNode, className?: string, variant?: 'default' | 'outline' } & React.HTMLAttributes<HTMLDivElement>> = ({ children, className, variant = 'default', ...props }) => {
  const baseClasses = 'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors';
  
  const variantClasses = {
    default: 'border-purple-500/30 bg-purple-500/20 text-purple-300',
    outline: 'border-slate-500 text-slate-300',
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)} {...props}>
      {children}
    </div>
  );
};

export { Badge };