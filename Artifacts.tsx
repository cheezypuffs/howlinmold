import React from 'react';
import { Button } from './ui/button';
import * as Icons from './Icons';
import { motion } from './motion';

const Artifacts: React.FC = () => {
    return (
        <div className="p-4 h-full flex flex-col bg-black/20 rounded-3xl">
            <header className="flex justify-between items-center mb-6 px-2 flex-shrink-0">
                <div className="flex items-center gap-4">
                     <Icons.Database className="w-8 h-8 text-purple-400" />
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Artifacts</h1>
                        <p className="text-slate-400 text-sm">Manage your generated and saved creations.</p>
                    </div>
                </div>
            </header>

            <main className="flex-grow min-h-0 flex items-center justify-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-8"
                >
                    <Icons.Database className="w-16 h-16 text-cyan-400/50 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-slate-200">The Vault is Being Constructed</h2>
                    <p className="text-slate-400 mt-2 max-w-md mx-auto">
                       This space will soon house your saved synth presets, recorded mixes, and generated ritual assets.
                    </p>
                    <p className="text-xs text-slate-500 mt-4">(Coming Soon)</p>
                </motion.div>
            </main>
        </div>
    );
};

export default Artifacts;
