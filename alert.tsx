import React from 'react';
import { cn } from '../../utils/cn';

const Alert: React.FC<{ children: React.ReactNode, className?: string, variant?: 'default' | 'destructive' }> = ({ children, className, variant = 'default' }) => {
    const variantClasses = {
        default: 'bg-background text-foreground border-purple-500/30',
        destructive: 'border-red-500/50 text-red-300',
    };
    return (
        <div className={cn("p-4 border rounded-md flex items-center gap-2", variantClasses[variant], className)}>
            {children}
        </div>
    );
};

const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => <p>{children}</p>;

export { Alert, AlertDescription };