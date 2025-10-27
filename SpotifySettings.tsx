import React from 'react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from './motion';

interface SpotifySettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

const SpotifySettings: React.FC<SpotifySettingsProps> = ({ isOpen, onClose, onSave }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-md"
                    >
                        <h2 className="text-xl font-bold mb-4 text-white">Spotify Settings</h2>
                        <p className="text-slate-400 mb-6">
                            This is where Spotify integration settings, such as connection management and quality options, will be available.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button onClick={onSave}>Save Settings</Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SpotifySettings;