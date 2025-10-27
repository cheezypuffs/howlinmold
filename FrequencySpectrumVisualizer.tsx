// components/FrequencySpectrumVisualizer.tsx
import React, { useRef } from 'react';
import { useAnimationLoop } from '../hooks/useAnimationLoop';

interface FrequencySpectrumVisualizerProps {
  analyserNode: AnalyserNode;
  width: number;
  height: number;
}

const FrequencySpectrumVisualizer: React.FC<FrequencySpectrumVisualizerProps> = ({ analyserNode, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, width, height);

    const barWidth = (width / bufferLength) * 2.5;
    let x = 0;

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#7209b7'); // purple
    gradient.addColorStop(0.5, '#f72585'); // pink
    gradient.addColorStop(1, '#4cc9f0'); // cyan

    ctx.fillStyle = gradient;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height;
      
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
  };

  useAnimationLoop(draw, true);

  // Set canvas dimensions via props to ensure proper scaling on render
  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default FrequencySpectrumVisualizer;