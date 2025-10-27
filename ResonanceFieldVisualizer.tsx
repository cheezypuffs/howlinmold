// components/ResonanceFieldVisualizer.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import type { DeckState, FrequencySignature } from '../types';
import { clamp } from '../utils/helpers';
import { rgbToRgba, lerpColor } from '../lib/colorUtils';

interface ResonanceFieldVisualizerProps {
    masterDeckState: DeckState;
    crossfaderValue: number;
    targetSignature: FrequencySignature | null;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    baseRadius: number;
    color: string;
    // For target particles
    isTarget?: boolean;
    angle?: number;
    orbitRadius?: number;
    frequency?: number;
}

const ResonanceFieldVisualizer: React.FC<ResonanceFieldVisualizerProps> = ({ masterDeckState, crossfaderValue, targetSignature }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const targetParticlesRef = useRef<Particle[]>([]);
    const animationFrameId = useRef<number | null>(null);

    const stateRef = useRef({ masterDeckState, crossfaderValue, targetSignature });
    useEffect(() => {
        stateRef.current = { masterDeckState, crossfaderValue, targetSignature };
    }, [masterDeckState, crossfaderValue, targetSignature]);

    const deckAColorRgb = 'rgb(76, 201, 240)';
    const deckBColorRgb = 'rgb(247, 37, 133)';
    const targetColor = 'rgb(255, 230, 109)';

    const createTargetParticles = useCallback((signature: FrequencySignature, width: number, height: number) => {
        const center = { x: width / 2, y: height / 2 };
        const frequencies = [signature.frequency, ...signature.harmonics.slice(0, 4)];
        return frequencies.map((freq, i) => {
            const orbitRadius = 50 + i * 25;
            return {
                x: center.x, y: center.y, vx: 0, vy: 0,
                radius: 4, baseRadius: 4, color: targetColor, isTarget: true,
                angle: Math.random() * Math.PI * 2,
                orbitRadius: orbitRadius,
                frequency: freq
            };
        });
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const { width, height } = canvas.getBoundingClientRect();
        if (width > 0 && height > 0) {
            targetParticlesRef.current = targetSignature ? createTargetParticles(targetSignature, width, height) : [];
        }
    }, [targetSignature, createTargetParticles]);

    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const dpr = window.devicePixelRatio || 1;
        const parent = canvas.parentElement;
        if (!parent) return;

        const initializeParticles = (width: number, height: number) => {
            particlesRef.current = Array.from({ length: 50 }, () => {
                const initialColor = lerpColor(deckAColorRgb, deckBColorRgb, stateRef.current.crossfaderValue);
                const baseRadius = Math.random() * 2 + 1;
                return {
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: baseRadius,
                    baseRadius: baseRadius,
                    color: initialColor,
                };
            });
        };

        const renderFrame = () => {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            const { width, height } = canvas.getBoundingClientRect();
    
            ctx.fillStyle = 'rgba(19, 16, 35, 0.1)';
            ctx.fillRect(0, 0, width, height);
    
            const { masterDeckState, crossfaderValue } = stateRef.current;
            const { bpm, playing, currentTime, vu, duration } = masterDeckState;
            const beatProgress = (playing && bpm && duration > 0) ? (currentTime * bpm / 60) % 1 : 0;
            const beatPulse = Math.pow(1 - Math.sin(beatProgress * Math.PI), 4);
            const energy = clamp(vu * 2 + beatPulse * 0.5, 0, 1);
            
            const targetColorMixed = lerpColor(deckAColorRgb, deckBColorRgb, crossfaderValue);
            const targetColorRgb = targetColorMixed.match(/\d+/g)?.map(Number) ?? [0,0,0];
    
            // Render main mix particles
            particlesRef.current.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
    
                if (p.x - p.radius < 0 || p.x + p.radius > width) { p.x = clamp(p.x, p.radius, width - p.radius); p.vx *= -1; }
                if (p.y - p.radius < 0 || p.y + p.radius > height) { p.y = clamp(p.y, p.radius, height - p.radius); p.vy *= -1; }
                p.radius = p.baseRadius + energy * p.baseRadius * 1.5;
    
                const currentColorRgb = p.color.match(/\d+/g)?.map(Number) ?? [0,0,0];
                const newR = currentColorRgb[0] + (targetColorRgb[0] - currentColorRgb[0]) * 0.05;
                const newG = currentColorRgb[1] + (targetColorRgb[1] - currentColorRgb[1]) * 0.05;
                const newB = currentColorRgb[2] + (targetColorRgb[2] - currentColorRgb[2]) * 0.05;
                p.color = `rgb(${newR}, ${newG}, ${newB})`;
    
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
                gradient.addColorStop(0, rgbToRgba(p.color, 1));
                gradient.addColorStop(0.5, rgbToRgba(p.color, 0.5));
                gradient.addColorStop(1, rgbToRgba(p.color, 0));
                ctx.fillStyle = gradient;
                ctx.fill();
            });

            // Render target signature particles
            const time = Date.now() * 0.001;
            const center = { x: width/2, y: height/2 };
            targetParticlesRef.current.forEach(p => {
                p.angle! += (p.frequency! / 1000);
                p.x = center.x + Math.cos(p.angle!) * p.orbitRadius!;
                p.y = center.y + Math.sin(p.angle!) * p.orbitRadius!;
                p.radius = p.baseRadius + Math.sin(time * 5) * 1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
                gradient.addColorStop(0, rgbToRgba(p.color, 1));
                gradient.addColorStop(0.7, rgbToRgba(p.color, 0.4));
                gradient.addColorStop(1, rgbToRgba(p.color, 0));
                ctx.fillStyle = gradient;
                ctx.fill();
            });
    
            animationFrameId.current = requestAnimationFrame(renderFrame);
        };

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
                    canvas.width = width * dpr;
                    canvas.height = height * dpr;
                    const ctx = canvas.getContext('2d');
                    ctx?.scale(dpr, dpr);
                    initializeParticles(width, height);
                    if (targetSignature) {
                        targetParticlesRef.current = createTargetParticles(targetSignature, width, height);
                    }
                }
            }
        });

        resizeObserver.observe(parent);
        
        const { width, height } = parent.getBoundingClientRect();
        if (width > 0 && height > 0) {
            initializeParticles(width, height);
        }

        animationFrameId.current = requestAnimationFrame(renderFrame);

        return () => {
            resizeObserver.disconnect();
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    );
};

export default ResonanceFieldVisualizer;
