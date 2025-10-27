import React, { useEffect, useRef } from "react";
import { phaseColor, rgbToRgba } from "../../lib/colorUtils";
import { useTelemetry } from "../../hooks/useTelemetry";

export function VisualPulseEngine() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { resonanceScore } = useTelemetry();

  // Define your 4-color ritual palette (modify freely)
  const palette = [
    "rgb(157, 123, 255)", // violet
    "rgb(0, 211, 255)",   // cyan
    "rgb(255, 80, 180)",  // magenta
    "rgb(255, 220, 100)", // golden
  ];

  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    let t = 0;
    let raf: number;

    const loop = () => {
      t += 0.005 + resonanceScore * 0.02; // speed influenced by resonance
      const w = (cvs.width = cvs.clientWidth);
      const h = (cvs.height = 120);
      if (!ctx) return;

      // Compute phase-based color
      const pulseColor = phaseColor(palette, Math.sin(t) * 0.5 + 0.5);

      // Gradient background using rgba alpha fades
      const pulseGradient = ctx.createLinearGradient(0, 0, w, h);
      pulseGradient.addColorStop(0, rgbToRgba(pulseColor, 0.15));
      pulseGradient.addColorStop(0.5, rgbToRgba(pulseColor, 0.35 + resonanceScore * 0.3));
      pulseGradient.addColorStop(1, rgbToRgba(pulseColor, 0.15));

      ctx.fillStyle = pulseGradient;
      ctx.fillRect(0, 0, w, h);

      // Dynamic waveform
      ctx.beginPath();
      for (let x = 0; x < w; x += 6) {
        const y =
          h / 2 +
          Math.sin((x + t * 200) / 25) *
            20 *
            (0.5 + resonanceScore * 0.8);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = pulseColor;
      ctx.lineWidth = 1.5 + resonanceScore * 2;
      ctx.stroke();

      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(raf);
  }, [resonanceScore]);

  return (
    <div className="panel p-2">
      <canvas ref={ref} className="w-full h-[120px]" />
    </div>
  );
}