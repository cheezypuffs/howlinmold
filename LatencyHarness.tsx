// /components/LatencyHarness.tsx
import React, { useEffect, useRef, useState } from 'react';
import { AudioEngine } from '../audio/AudioEngine';
import { cn } from '../utils/cn';

export const LatencyHarness: React.FC<{ engine: AudioEngine }> = ({ engine }) => {
  const [drift, setDrift] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const loop = () => {
      try {
        const d = engine.getDiagnostics();
        const ok =
          d.A.isPlaying && d.B.isPlaying &&
          d.A.type === 'local' && d.B.type === 'local' &&
          d.A.startedAt != null && d.B.startedAt != null;
        if (ok) {
          const diff = Math.abs((d.A.startedAt as number) - (d.B.startedAt as number)) * 1000;
          setDrift(diff);
        } else {
          setDrift(null);
        }
      } catch {
        setDrift(null);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [engine]);

  const color = drift == null ? 'text-slate-400' : drift < 2 ? 'text-green-400' : drift < 5 ? 'text-yellow-400' : 'text-red-400';
  
  return (
    <div className={cn("text-xs font-mono transition-colors", color)} title="Deck Sync Drift (Latency Harness)">
      &Delta; {drift == null ? '---' : `${drift.toFixed(1)}ms`}
    </div>
  );
};

export default LatencyHarness;