import React from 'react';
import { Button } from './ui/button';
import * as Icons from './Icons';
import { motion, AnimatePresence } from './motion';

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

const UpsellModal: React.FC<UpsellModalProps> = ({ isOpen, onClose, onSubscribe }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-900 to-black border border-amber-500/30 rounded-2xl p-8 max-w-lg w-full text-center"
          >
            <Icons.Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Discovery Limit Reached</h2>
            <p className="text-slate-300 mb-6">
              You've used all your free discovery credits for this month. Subscribe to HOWLIN' MOLD to unlock unlimited track discoveries and continue your sonic journey.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={onClose} variant="outline" className="border-white/20">Maybe Later</Button>
              <Button onClick={onSubscribe} className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
                View Subscription Plans
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpsellModal;