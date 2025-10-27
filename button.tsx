import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background-base)] disabled:opacity-50 disabled:pointer-events-none active:scale-98";

  const variantClasses = {
    default: 'bg-[var(--color-accent-purple)] text-white hover:bg-purple-600',
    outline: 'border border-[var(--color-border-light)] bg-transparent hover:bg-white/10 hover:text-white',
    ghost: 'hover:bg-white/10 hover:text-white',
    destructive: 'bg-red-600 text-white hover:bg-red-500',
    link: 'text-purple-400 underline-offset-4 hover:underline',
  };

  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button };