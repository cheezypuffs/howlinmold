// components/Explore.tsx
import React, { useState } from 'react';
import { motion } from './motion';
import * as Icons from './Icons';
import { Button } from './ui/button';
import ExploreSearch from './ExploreSearch';
import GenreTaxonomy from './GenreTaxonomy';
import GenreLoreGalaxy from './GenreLoreGalaxy';

type ExploreView = 'search' | 'taxonomy' | 'galaxy';

const Explore: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [view, setView] = useState<ExploreView>('search');

    const renderView = () => {
        switch(view) {
            case 'search':
                return <ExploreSearch onBack={() => setView('search')} />;
            case 'taxonomy':
                return <GenreTaxonomy onBack={() => setView('search')} />;
            case 'galaxy':
                return <GenreLoreGalaxy onNodeClick={(node) => console.log('Node clicked:', node)} />;
            default:
                // FIX: The original code returned a component that was causing a type error.
                // This now correctly returns the intended default component.
                return <ExploreSearch onBack={() => setView('search')} />;
        }
    };
    
    return (
        <div className="p-4 h-full flex flex-col bg-black/20 rounded-3xl">
            <header className="flex justify-between items-center mb-6 px-2 flex-shrink-0">
                <div className="flex items-center gap-4">
                     <Button onClick={onBack} variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10">
                        <Icons.ExploreIcon className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Explore</h1>
                        <p className="text-slate-400 text-sm">Discover new sounds from blogs, archives, and alternate realities.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-1 bg-black/30 rounded-lg">
                    <Button onClick={() => setView('search')} variant={view === 'search' ? 'outline' : 'ghost'} className={view === 'search' ? 'bg-white/10' : ''}><Icons.Search className="w-4 h-4 mr-2"/>Search</Button>
                    <Button onClick={() => setView('taxonomy')} variant={view === 'taxonomy' ? 'outline' : 'ghost'} className={view === 'taxonomy' ? 'bg-white/10' : ''}><Icons.GitBranch className="w-4 h-4 mr-2"/>Taxonomy</Button>
                    <Button onClick={() => setView('galaxy')} variant={view === 'galaxy' ? 'outline' : 'ghost'} className={view === 'galaxy' ? 'bg-white/10' : ''}><Icons.Orbit className="w-4 h-4 mr-2"/>Galaxy</Button>
                </div>
            </header>

            <main className="flex-grow min-h-0">
                {renderView()}
            </main>
        </div>
    );
};

export default Explore;
