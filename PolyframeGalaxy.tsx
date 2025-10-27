import React from 'react';
import * as Icons from './Icons';
import { usePolyframeData } from '../hooks/usePolyframeData';

const PolyframeGalaxy: React.FC = () => {
    const { isLoading, nodes, edges } = usePolyframeData();

    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-8 bg-black/30 rounded-lg border border-white/10">
            <Icons.Orbit className="w-16 h-16 mb-4" />
            <h2 className="text-2xl font-bold text-slate-300">Polyframe Galaxy</h2>
            {isLoading ? (
                <p className="mt-2">Loading data...</p>
            ) : (
                <>
                    <p className="mt-2 max-w-md">
                        This 3D visualization feature is under construction.
                    </p>
                    <p className="text-xs mt-4">Loaded {nodes.length} nodes and {edges.length} edges.</p>
                </>
            )}
        </div>
    );
};

export default PolyframeGalaxy;
