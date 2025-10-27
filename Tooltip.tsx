// FIX: Added React import to solve JSX errors.
import React from 'react';

interface TooltipProps {
  text: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => (
    <div className="relative group">
        {children}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs
                        bg-slate-800 text-white text-xs rounded-md p-2 z-20
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
                        border border-slate-600 shadow-lg">
            {text}
            <svg className="absolute text-slate-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
            </svg>
        </div>
    </div>
);