
import React, { useState } from 'react';
import { motion, AnimatePresence } from './motion';
import { Button } from './ui/button';
import * as Icons from './Icons';
import { genreLibrary } from '../data/genreLibrary';
import { cn } from '../utils/cn';

interface GenreSelectorProps {
  onBuildCrate: (selectedGenres: string[]) => void;
  isLoading: boolean;
}

const GenreCard: React.FC<{
  genre: typeof genreLibrary[0];
  isSelected: boolean;
  onSelect: () => void;
}> = ({ genre, isSelected, onSelect }) => {
  const Icon = genre.icon;
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn(
        'bg-white/5 backdrop-blur-xl border-2 rounded-2xl p-6 cursor-pointer transition-all duration-200',
        isSelected ? 'border-purple-500 shadow-lg shadow-purple-900/50' : 'border-white/10 hover:border-white/20'
      )}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <Icon className="w-8 h-8 text-purple-300 mb-4" />
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              
              className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
            >
              <Icons.Check className="w-4 h-4 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <h3 className="text-xl font-bold text-white">{genre.name}</h3>
      <p className="text-sm text-slate-400 mt-1">{genre.description}</p>
    </motion.div>
  );
};

const GenreSelector: React.FC<GenreSelectorProps> = ({ onBuildCrate, isLoading }) => {
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => {
      const newSet = new Set(prev);
      if (newSet.has(genreId)) {
        newSet.delete(genreId);
      } else {
        newSet.add(genreId);
      }
      return newSet;
    });
  };

  const handleBuildCrate = () => {
    onBuildCrate(Array.from(selectedGenres));
  };
  
  const handleSkip = () => {
      onBuildCrate([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-8 max-w-4xl w-full text-white shadow-2xl shadow-purple-900/20"
      >
        <div className="text-center mb-8">
          <Icons.Gem className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-300">Select Your Sonic Signatures</h1>
          <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
            Choose your preferred genres to pre-populate your crate with a curated selection of tracks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {genreLibrary.map(genre => (
            <GenreCard
              key={genre.id}
              genre={genre}
              isSelected={selectedGenres.has(genre.id)}
              onSelect={() => toggleGenre(genre.id)}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button onClick={handleBuildCrate} size="lg" className="bg-purple-600 hover:bg-purple-700 font-bold px-8 py-4 text-lg w-full sm:w-auto" disabled={isLoading}>
            {isLoading ? (
                <>
                    <Icons.Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Building Crate...
                </>
            ) : (
                <>
                    <Icons.Layers className="w-5 h-5 mr-2" />
                    Build My Crate ({selectedGenres.size})
                </>
            )}
          </Button>
          <Button onClick={handleSkip} variant="ghost" className="text-slate-400 hover:text-white w-full sm:w-auto" disabled={isLoading}>
              Skip For Now
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GenreSelector;