import React, { useState } from 'react';
import { motion } from '../motion';
import * as Icons from '../Icons';
import { Search } from 'lucide-react';

interface CosmicSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const CosmicSearchBar: React.FC<CosmicSearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search your cosmic collection...",
  onFocus,
  onBlur
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative w-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        scale: isFocused ? 1.02 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Search input */}
      <motion.div
        className="relative rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(27, 28, 58, 0.6) 0%, rgba(10, 10, 20, 0.7) 100%)',
          backdropFilter: 'blur(16px) saturate(160%)',
          WebkitBackdropFilter: 'blur(16px) saturate(160%)',
          border: isFocused 
            ? '1.5px solid rgba(214, 181, 93, 0.6)' 
            : '1px solid rgba(214, 181, 93, 0.2)',
        }}
        animate={{
          boxShadow: isFocused
            ? `
                0 8px 32px rgba(0, 0, 0, 0.6),
                0 0 70px rgba(44, 225, 208, 0.5),
                0 0 40px rgba(44, 225, 208, 0.4),
                0 0 20px rgba(214, 181, 93, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                inset 0 0 25px rgba(44, 225, 208, 0.15)
              `
            : isHovered
            ? `
                0 6px 24px rgba(0, 0, 0, 0.4),
                0 0 40px rgba(214, 181, 93, 0.3),
                0 0 20px rgba(214, 181, 93, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.08)
              `
            : `
                0 4px 16px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.05)
              `
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Search icon with glow */}
          <motion.div
            animate={{ 
              scale: isFocused ? 1.1 : 1,
              opacity: isFocused ? 1 : 0.6
            }}
            transition={{ duration: 0.2 }}
          >
            <Search className="w-5 h-5" style={{ color: 'var(--hm-gold)' }} />
          </motion.div>

          {/* Input field */}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none text-[var(--hm-cream)] placeholder:text-[var(--hm-cream)]/40"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.938rem'
            }}
             onFocus={() => {
              setIsFocused(true);
              onFocus?.();
            }}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
          />

          {/* Clear button */}
          {value && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => onChange('')}
              className="w-6 h-6 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: 'rgba(214, 181, 93, 0.1)',
                color: 'var(--hm-gold)'
              }}
              whileHover={{ 
                background: 'rgba(214, 181, 93, 0.2)',
                scale: 1.1
              }}
            >
              <Icons.X className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Active search indicator */}
        {isFocused && value && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            className="absolute bottom-0 left-0 h-0.5"
            style={{
              background: 'linear-gradient(90deg, var(--hm-gold), var(--hm-cyan))',
              boxShadow: '0 0 8px rgba(214, 181, 93, 0.6)'
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};
