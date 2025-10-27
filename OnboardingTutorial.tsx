import React from 'react';
import { motion, AnimatePresence } from './motion';
import { Button } from './ui/button';
import * as Icons from './Icons';

interface OnboardingTutorialProps {
  onClose: () => void;
}

const KeyDisplay: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <kbd className={`px-2 py-1.5 text-xs font-semibold text-purple-200 bg-black/30 border border-purple-500/30 rounded-md ${className}`}>
    {children}
  </kbd>
);

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-8 max-w-2xl w-full text-white shadow-2xl shadow-purple-900/20"
        >
          <div className="text-center mb-6">
            <Icons.Gem className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-300">Welcome to the Ritual</h1>
            <p className="text-slate-400 mt-2">A quick guide to the core keyboard controls.</p>
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-bold text-cyan-300 mb-3 flex items-center gap-2"><Icons.SynthIcon className="w-5 h-5" /> Synth Controls</h2>
              <div className="bg-black/20 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Play Notes (White Keys)</p>
                  <div className="flex gap-1">
                    <KeyDisplay>A</KeyDisplay>
                    <KeyDisplay>S</KeyDisplay>
                    <KeyDisplay>D</KeyDisplay>
                    <KeyDisplay>F</KeyDisplay>
                    <KeyDisplay>G</KeyDisplay>
                    <KeyDisplay>H</KeyDisplay>
                    <KeyDisplay>J</KeyDisplay>
                    <KeyDisplay>K</KeyDisplay>
                    <KeyDisplay>L</KeyDisplay>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Play Notes (Black Keys)</p>
                  <div className="flex gap-1">
                    <KeyDisplay>W</KeyDisplay>
                    <KeyDisplay>E</KeyDisplay>
                    <KeyDisplay>T</KeyDisplay>
                    <KeyDisplay>Y</KeyDisplay>
                    <KeyDisplay>U</KeyDisplay>
                    <KeyDisplay>O</KeyDisplay>
                    <KeyDisplay>P</KeyDisplay>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Change Octave</p>
                  <div className="flex items-center gap-2">
                    <KeyDisplay>Z</KeyDisplay><span>Down</span>
                    <KeyDisplay>X</KeyDisplay><span>Up</span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-pink-300 mb-3 flex items-center gap-2"><Icons.Layers className="w-5 h-5" /> Deck & Pad Controls</h2>
              <div className="bg-black/20 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Delete a Hotcue</p>
                  <div className="flex items-center gap-2">
                    <KeyDisplay>Shift</KeyDisplay> + <span>Click on Pad</span>
                  </div>
                </div>
                 <div className="flex items-center justify-between">
                  <p className="font-semibold">Edit a Hotcue</p>
                  <div className="flex items-center gap-2">
                    <span>Right-Click on Pad</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8 text-center">
            <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700 font-bold px-8 py-3 text-lg">
              Begin Ritual
            </Button>
          </div>
          <p className="text-xs text-slate-500 text-center mt-4">
            Note: Keyboard shortcuts for the synth won't work if you're typing in a text field.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingTutorial;