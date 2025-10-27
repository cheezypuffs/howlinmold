

import React from 'react';
import { cn } from '../../utils/cn';

const Avatar: React.FC<{ children: React.ReactNode, className?: string } & React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...props}>
    {children}
  </div>
);

export { Avatar };