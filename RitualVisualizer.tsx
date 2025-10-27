import React from 'react';
import { motion } from './motion';
import * as Icons from './Icons';

interface RitualVisualizerProps {
  status: 'idle' | 'generating' | 'done' | 'error';
  prompt: string;
  currentVideoUrl: string | null;
}

const RitualVisualizer: React.FC<RitualVisualizerProps> = ({ status, prompt, currentVideoUrl }) => {
  return (
    <div className="w-full aspect-video bg-black/30 rounded-lg border border-white/10 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
      {status === 'generating' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 text-slate-300"
        >
          <Icons.Orbit className="w-16 h-16 text-purple-400/50 animate-spin" />
          <h3 className="font-bold">Transmuting Visuals...</h3>
          <p className="text-sm text-slate-400 italic max-w-md">
            &ldquo;{prompt}&rdquo;
          </p>
        </motion.div>
      )}
      {status === 'done' && currentVideoUrl ? (
         <video
            key={currentVideoUrl} // Force re-render on src change
            src={currentVideoUrl}
            autoPlay
            muted
            loop
            className="w-full h-full rounded-md object-cover"
         />
      ) : status === 'done' && !currentVideoUrl ? (
        <div className="text-red-400">
            <Icons.AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Video generation failed or returned no URL.</p>
        </div>
      ) : null}

      {status === 'idle' && (
        <div className="text-slate-500">
            <Icons.Zap className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Visuals will manifest here once the ritual begins.</p>
        </div>
      )}
       {status === 'error' && (
        <div className="text-red-400">
            <Icons.AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>An error occurred during video generation.</p>
        </div>
      )}
    </div>
  );
};

export default RitualVisualizer;
