import React from 'react';
import { Button } from './ui/button';

const ExplorePortal: React.FC<{onBack: () => void}> = ({ onBack }) => {
    return (
         <div className="p-4 h-full flex flex-col items-center justify-center text-center">
             <h1 className="text-4xl font-bold text-white/80">Explore Portal</h1>
            <p className="text-lg text-slate-400 mt-2">Music discovery features are coming soon.</p>
             <Button onClick={onBack} className="mt-6">Back to Deck</Button>
        </div>
    );
};

export default ExplorePortal;
