import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from './motion';
import * as Icons from './Icons';
import { Button } from './ui/button';
import {
  applyMoodTheme,
  getThemeByMood,
  saveTheme,
  getAllMoods,
  getRandomTheme,
  type MoodTheme,
} from '../services/theme/moodPalette';
import { useTelemetry } from '../hooks/useTelemetry';


interface MoodPaletteInputProps {
  onThemeChange?: (theme: MoodTheme) => void;
}

const MoodPaletteInput: React.FC<MoodPaletteInputProps> = ({ onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<MoodTheme | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { log } = useTelemetry();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);
  
  const handleThemeChange = (theme: MoodTheme) => {
      applyMoodTheme(theme);
      saveTheme(theme);
      setCurrentTheme(theme);
      log({ type: 'mood_palette_changed', mood: theme.name.toLowerCase(), name: theme.name });
      if (onThemeChange) {
        onThemeChange(theme);
      }
  };

  const handleRandomClick = () => {
    const theme = getRandomTheme();
    handleThemeChange(theme);
  };
  
  const handlePresetClick = (mood: string) => {
      const theme = getThemeByMood(mood);
      handleThemeChange(theme);
  };
  
  const allMoods = getAllMoods();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 bg-black/70 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl shadow-lg p-4"
          >
            <h3 className="font-bold text-sm mb-3 text-[var(--color-text)]">Mood Palette</h3>
            
            <Button
              onClick={handleRandomClick}
              variant="outline"
              className="w-full mb-3 border-[var(--color-border)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 hover:text-[var(--color-accent)]"
            >
              <Icons.Sparkles className="w-4 h-4 mr-2" />
              Random Theme
            </Button>
            
            <p className="text-xs text-center text-[var(--color-text-secondary)] mb-3">... or choose a preset ...</p>
            
            <div className="grid grid-cols-4 gap-2">
              {allMoods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => handlePresetClick(mood)}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-md hover:bg-white/10 transition-colors"
                >
                  <div
                    className="w-6 h-6 rounded-full border-2"
                    style={{
                      borderColor: getThemeByMood(mood).colors.primary,
                      backgroundColor: getThemeByMood(mood).colors.secondary,
                    }}
                  />
                  <span className="text-xs capitalize text-[var(--color-text-secondary)]">{mood}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-black/50 backdrop-blur-lg border-2 border-white/20 rounded-full flex items-center justify-center text-white shadow-xl"
        style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-background)',
            color: 'var(--color-primary)'
        }}
        aria-label="Open Mood Palette"
      >
        <Icons.Palette className="w-7 h-7" />
      </motion.button>
    </div>
  );
};

export default MoodPaletteInput;