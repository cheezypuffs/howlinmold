import React from 'react';
import { Button } from './ui/button';
import * as Icons from './Icons';
import { motion } from './motion';

const Analytics: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="p-4 h-full flex flex-col bg-black/20 rounded-3xl">
            <header className="flex justify-between items-center mb-6 px-2 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Button onClick={onBack} variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10">
                        <Icons.BarChart3 className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Musical DNA</h1>
                        <p className="text-slate-400 text-sm">Analyze your unique sonic signature.</p>
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
                    <Icons.BrainCircuit className="w-16 h-16 text-cyan-400/50 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-slate-200">Advanced Insights Dashboard</h2>
                    <p className="text-slate-400 mt-2 max-w-md mx-auto">
                        This feature is part of the HOWLIN' STUDIO plan. Analyze your library, visualize your mixing habits, and receive AI-powered feedback.
                    </p>
                    <p className="text-xs text-slate-500 mt-4">(Coming Soon)</p>
                </motion.div>
            </main>
        </div>
    );
};

export default Analytics;