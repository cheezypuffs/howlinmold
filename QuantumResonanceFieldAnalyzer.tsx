import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from './motion';
import * as Icons from './Icons';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useConsciousness } from '../contexts/ConsciousnessContext';
import { useToast } from '../hooks/use-toast';
import type { ResonanceField, QuantumOscillator, ResonancePattern, AnalysisResult, FrequencySignature } from '../types';

interface QuantumResonanceFieldAnalyzerProps {
    targetSignature: FrequencySignature | null;
    onClearTarget: () => void;
}

const QuantumResonanceFieldAnalyzer: React.FC<QuantumResonanceFieldAnalyzerProps> = ({ targetSignature, onClearTarget }) => {
  const consciousness = useConsciousness();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const { toast } = useToast();
  
  const [resonanceFields, setResonanceFields] = useState<ResonanceField[]>([]);
  const [targetResonanceFields, setTargetResonanceFields] = useState<ResonanceField[]>([]);
  const [quantumOscillators, setQuantumOscillators] = useState<QuantumOscillator[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult>({
    dominantFrequency: 0, coherenceLevel: 0, quantumEntanglement: 0, consciousnessResonance: 0,
    healingPotential: 0, harmonicComplexity: 0, fieldStability: 0, emergentPatterns: []
  });
  const [selectedPattern, setSelectedPattern] = useState('solfeggio');
  const [masterFrequency, setMasterFrequency] = useState(432);
  const [consciousnessSync, setConsciousnessSync] = useState(true);
  const [quantumEntanglement, setQuantumEntanglement] = useState(false);
  const [activeTab, setActiveTab] = useState('patterns');
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'success' | 'failed'>('idle');
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatusText, setSyncStatusText] = useState('');

  const resonancePatterns: ResonancePattern[] = [
    { id: 'solfeggio', name: 'Solfeggio Frequencies', frequencies: [174, 285, 396, 417, 528, 639, 741, 852, 963], description: 'Ancient healing frequencies for spiritual transformation', consciousnessEffect: 'Chakra alignment and energy healing', healingProperties: ['DNA repair', 'Emotional healing', 'Spiritual awakening'] },
    { id: 'binaural', name: 'Binaural Beats', frequencies: [4, 8, 16, 32, 40], description: 'Brainwave entrainment frequencies', consciousnessEffect: 'Altered states of consciousness', healingProperties: ['Meditation', 'Focus enhancement', 'Sleep improvement'] },
    { id: 'schumann', name: 'Schumann Resonances', frequencies: [7.83, 14.3, 20.8, 27.3, 33.8], description: 'Earth\'s electromagnetic field frequencies', consciousnessEffect: 'Grounding and natural synchronization', healingProperties: ['Stress reduction', 'Natural rhythm', 'Earth connection'] },
    { id: 'fibonacci', name: 'Fibonacci Harmonics', frequencies: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55].map(n => n * 10), description: 'Golden ratio frequency relationships', consciousnessEffect: 'Sacred geometry consciousness activation', healingProperties: ['Harmonic balance', 'Natural resonance', 'Sacred geometry'] },
    { id: 'planetary', name: 'Planetary Frequencies', frequencies: [126.22, 136.10, 141.27, 172.06, 183.58, 194.18, 207.36, 211.44, 221.23], description: 'Frequencies derived from planetary orbits', consciousnessEffect: 'Cosmic consciousness alignment', healingProperties: ['Cosmic harmony', 'Astrological healing', 'Universal connection'] }
  ];

  const createFieldsFromSignature = (signature: FrequencySignature, isTarget = false): ResonanceField[] => {
    const frequencies = [signature.frequency, ...signature.harmonics];
    return frequencies.map((freq, index) => {
        const angle = (index / frequencies.length) * Math.PI * 2;
        const radius = 100 + index * 20;
        return {
            id: `target_field_${index}`, frequency: freq, amplitude: signature.amplitude, phase: index * (Math.PI / 4),
            coherence: 0.8 + Math.random() * 0.2, position: { x: 400 + Math.cos(angle) * radius, y: 300 + Math.sin(angle) * radius, z: index * 0.1 },
            radius: 20 + freq / 50, harmonic: index + 1, resonanceType: isTarget ? 'quantum' : 'consciousness',
            consciousness: consciousness.consciousnessLevel.current, entanglement: []
        };
    });
  };

  const initializeFields = useCallback(() => {
    const pattern = resonancePatterns.find(p => p.id === selectedPattern);
    if (!pattern) return;
    const fields = pattern.frequencies.map((freq, index) => {
        const angle = (index / pattern.frequencies.length) * Math.PI * 2;
        const radius = 100 + index * 20;
        const field: ResonanceField = {
            id: `field_${index}`, frequency: freq, amplitude: 0.5 + Math.random() * 0.5, phase: index * (Math.PI / 4),
            coherence: 0.7 + Math.random() * 0.3, position: { x: 400 + Math.cos(angle) * radius, y: 300 + Math.sin(angle) * radius, z: index * 0.1 },
            radius: 20 + freq / 50, harmonic: index + 1, resonanceType: pattern.id as any,
            consciousness: consciousness.consciousnessLevel.current * (0.8 + Math.random() * 0.4), entanglement: []
        };
        if (quantumEntanglement && index > 0 && fields[index - 1]) {
            field.entanglement.push(fields[index - 1].id);
            fields[index - 1].entanglement.push(field.id);
        }
        return field;
    });
    setResonanceFields(fields);
  }, [selectedPattern, consciousness.consciousnessLevel, quantumEntanglement]);

  useEffect(() => {
    initializeFields();
  }, [initializeFields]);
  
  useEffect(() => {
      if(targetSignature) {
          setTargetResonanceFields(createFieldsFromSignature(targetSignature, true));
      } else {
          setTargetResonanceFields([]);
      }
  }, [targetSignature]);


  const analyzeQuantumField = useCallback(() => { /* ... (analysis logic unchanged) ... */ }, [resonanceFields]);

  const renderQuantumField = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const time = Date.now() * 0.001;

    const drawField = (field: ResonanceField, isTarget = false) => {
        const oscillation = Math.sin(time * field.frequency * 0.01 + field.phase);
        const currentRadius = field.radius * (1 + oscillation * 0.3);
        const currentAmplitude = field.amplitude * (0.8 + 0.2 * oscillation);
        ctx.save();
        const gradient = ctx.createRadialGradient(field.position.x, field.position.y, 0, field.position.x, field.position.y, currentRadius);
        const hue = (field.frequency * 0.5) % 360;
        const saturation = isTarget ? 30 : 60 + field.coherence * 40;
        const lightness = isTarget ? 70 : 40 + currentAmplitude * 30;
        gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${currentAmplitude * (isTarget ? 0.3 : 1)})`);
        gradient.addColorStop(0.7, `hsla(${hue}, ${saturation}%, ${lightness * 0.7}%, ${currentAmplitude * (isTarget ? 0.15 : 0.5)})`);
        gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness * 0.3}%, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(field.position.x, field.position.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    resonanceFields.forEach(field => drawField(field, false));
    targetResonanceFields.forEach(field => drawField(field, true));

    animationFrameRef.current = requestAnimationFrame(renderQuantumField);
  }, [resonanceFields, targetResonanceFields]);

  useEffect(() => {
    if (!consciousnessSync) return;
    setResonanceFields(prev => prev.map(field => ({ ...field, consciousness: consciousness.consciousnessLevel.current, amplitude: Math.min(1, field.amplitude + (consciousness.consciousnessLevel.current - 50) * 0.002), coherence: Math.min(1, field.coherence + (consciousness.consciousnessLevel.current - 50) * 0.001) })));
  }, [consciousness.consciousnessLevel, consciousnessSync]);

  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(analyzeQuantumField, 1000);
    return () => clearInterval(interval);
  }, [isAnalyzing, analyzeQuantumField]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const resizeCanvas = () => { const container = canvas.parentElement; if (container) { canvas.width = container.clientWidth; canvas.height = container.clientHeight; } };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    renderQuantumField();
    return () => { window.removeEventListener('resize', resizeCanvas); if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [renderQuantumField]);

  const handleSyncAttempt = useCallback(() => {
    setSyncState('syncing');
    setSyncProgress(0);
    setSyncStatusText('Calibrating consciousness field...');

    const statuses = ['Aligning harmonics...', 'Matching resonance patterns...', 'Quantum tunneling initiated...'];
    let statusIndex = 0;
    const progressInterval = setInterval(() => {
        setSyncProgress(p => {
            const newProgress = p + 1;
            if (newProgress >= 33 && statusIndex === 0) { setSyncStatusText(statuses[0]); statusIndex++; }
            if (newProgress >= 66 && statusIndex === 1) { setSyncStatusText(statuses[1]); statusIndex++; }
            if (newProgress >= 100) {
                clearInterval(progressInterval);
                const successChance = (consciousness.consciousnessLevel.current / 100) * 0.7 + 0.2; // 20%-90%
                if (Math.random() < successChance) {
                    setSyncState('success');
                    setSyncStatusText('Synchronization Successful!');
                    consciousness.expandConsciousness(5);
                    toast({ title: 'Resonance Synchronized!', description: 'Your consciousness level has expanded by 5%.', type: 'success' });
                } else {
                    setSyncState('failed');
                    setSyncStatusText('Synchronization Failed: Unstable Matrix.');
                    toast({ title: 'Synchronization Failed', description: 'The target frequency was too complex to align.', type: 'error' });
                }
                setTimeout(() => { setSyncState('idle'); onClearTarget(); }, 2000);
            }
            return newProgress;
        });
    }, 40); // 4 seconds total
  }, [consciousness, onClearTarget, toast]);
  
  const generateQuantumTone = async () => { /* ... (tone generation logic unchanged) ... */ };

  const currentPattern = resonancePatterns.find(p => p.id === selectedPattern);

  return (
    <Card className="bg-gradient-to-br from-black/95 to-[#0a0a0f]/95 border-[#4ecdc4]/30 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#4ecdc4] to-[#ffe66d]">
            <Icons.Orbit className="w-8 h-8 text-[#4ecdc4]" />
            Quantum Resonance Field Analyzer
        </CardTitle>
        <p className="text-gray-400">Real-time visualization and synchronization of consciousness frequencies.</p>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <div className="relative h-96 bg-black/50 rounded-lg overflow-hidden mb-4 flex-shrink-0">
          <canvas ref={canvasRef} className="w-full h-full" />
          {/* ... (overlays unchanged) ... */}
        </div>

        <AnimatePresence mode="wait">
        {targetSignature ? (
            <motion.div key="sync-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-grow flex flex-col items-center justify-center text-center p-4 bg-white/5 rounded-2xl border border-white/20">
                <Icons.Target className="w-10 h-10 text-[#4ecdc4] mb-4" />
                <h3 className="text-xl font-mono text-white">Resonance Sync Target Acquired</h3>
                <p className="text-gray-400 mb-2">Target Frequency: {targetSignature.frequency.toFixed(2)} Hz</p>
                <p className="text-gray-400 mb-6">Pattern: {targetSignature.resonancePattern}</p>
                
                {syncState === 'syncing' ? (
                    <div className="w-full max-w-sm">
                        <Progress value={syncProgress} className="h-3 mb-2" />
                        <p className="text-sm text-[#4ecdc4] animate-pulse">{syncStatusText}</p>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <Button onClick={handleSyncAttempt} className="bg-gradient-to-r from-[#4ecdc4] to-[#9b59b6] text-white font-mono px-8 rounded-xl">
                            <Icons.Zap className="w-4 h-4 mr-2"/> Synchronize
                        </Button>
                        <Button onClick={onClearTarget} variant="outline" className="text-gray-300 border-white/20">
                            Cancel
                        </Button>
                    </div>
                )}
            </motion.div>
        ) : (
            <motion.div key="control-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-grow flex flex-col">
                 <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
                    <TabsList className="grid grid-cols-4 bg-black/50 border border-[#4ecdc4]/30">
                        <TabsTrigger value="patterns">Patterns</TabsTrigger>
                        <TabsTrigger value="quantum">Quantum</TabsTrigger>
                        <TabsTrigger value="analysis">Analysis</TabsTrigger>
                        <TabsTrigger value="consciousness">Consciousness</TabsTrigger>
                    </TabsList>
                    <div className="flex-grow mt-4 overflow-hidden relative">
                        <div className="absolute inset-0 overflow-auto">
                            <TabsContent value="patterns">
                                <div className="p-4 grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        {resonancePatterns.map(p => (
                                            <Button key={p.id} variant={selectedPattern === p.id ? 'default' : 'outline'} onClick={() => setSelectedPattern(p.id)} className={`w-full justify-start text-left ${selectedPattern === p.id ? 'bg-[#4ecdc4] text-black' : 'border-white/20'}`}>
                                                {p.name}
                                            </Button>
                                        ))}
                                    </div>
                                    {currentPattern && (
                                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                            <h4 className="font-bold text-lg text-white mb-2">{currentPattern.name}</h4>
                                            <p className="text-sm text-gray-300 mb-4">{currentPattern.description}</p>
                                            <div className="space-y-2 text-xs">
                                                <p><strong className="text-gray-400">Effect:</strong> {currentPattern.consciousnessEffect}</p>
                                                <p><strong className="text-gray-400">Properties:</strong></p>
                                                <div className="flex flex-wrap gap-2">
                                                    {currentPattern.healingProperties.map(prop => <Badge key={prop} variant="outline" className="border-[#4ecdc4]/30 text-[#4ecdc4]">{prop}</Badge>)}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="quantum">
                                <div className="p-4 space-y-6">
                                    <div>
                                        <label className="text-sm font-mono text-gray-300 mb-3 block">Master Frequency: {masterFrequency} Hz</label>
                                        <Slider value={[masterFrequency]} onValueChange={v => setMasterFrequency(v[0])} min={20} max={1000} step={1} />
                                    </div>
                                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                                        <div>
                                            <h4 className="font-bold text-white">Quantum Entanglement</h4>
                                            <p className="text-xs text-gray-400">Entangle resonance fields for complex harmonics.</p>
                                        </div>
                                        <Button onClick={() => setQuantumEntanglement(!quantumEntanglement)} variant={quantumEntanglement ? 'default' : 'outline'} className={quantumEntanglement ? 'bg-[#9b59b6]' : 'border-white/20'}>
                                            {quantumEntanglement ? 'Enabled' : 'Disabled'}
                                        </Button>
                                    </div>
                                    <Button onClick={generateQuantumTone} className="w-full bg-gradient-to-r from-[#ffe66d] to-[#ff6b6b] text-black">
                                        <Icons.Volume2 className="w-4 h-4 mr-2" />
                                        Generate Quantum Tone
                                    </Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="analysis">
                                <div className="p-4">
                                    <Button onClick={() => setIsAnalyzing(!isAnalyzing)} className={`w-full mb-4 ${isAnalyzing ? 'bg-red-600' : 'bg-green-600'}`}>
                                        {isAnalyzing ? 'Stop Analysis' : 'Start Real-time Analysis'}
                                    </Button>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="bg-white/5 p-3 rounded-lg">
                                            <p className="text-gray-400">Dominant Frequency</p>
                                            <p className="text-white font-mono text-lg">{analysisResults.dominantFrequency.toFixed(2)} Hz</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg">
                                            <p className="text-gray-400">Coherence Level</p>
                                            <Progress value={analysisResults.coherenceLevel * 100} className="my-1 h-2"/>
                                            <p className="text-white font-mono text-right">{(analysisResults.coherenceLevel * 100).toFixed(1)}%</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg">
                                            <p className="text-gray-400">Quantum Entanglement</p>
                                            <Progress value={analysisResults.quantumEntanglement * 100} className="my-1 h-2"/>
                                            <p className="text-white font-mono text-right">{(analysisResults.quantumEntanglement * 100).toFixed(1)}%</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg">
                                            <p className="text-gray-400">Consciousness Resonance</p>
                                            <Progress value={analysisResults.consciousnessResonance * 100} className="my-1 h-2"/>
                                            <p className="text-white font-mono text-right">{(analysisResults.consciousnessResonance * 100).toFixed(1)}%</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-lg col-span-2">
                                            <p className="text-gray-400">Emergent Patterns</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {analysisResults.emergentPatterns.length > 0 ? analysisResults.emergentPatterns.map(p => <Badge key={p} variant="outline" className="border-[#ffe66d]/30 text-[#ffe66d]">{p}</Badge>) : <p className="text-xs text-gray-500">None detected</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="consciousness">
                                <div className="p-4">
                                    <div className="text-center space-y-4">
                                        <h4 className="text-xl font-mono text-white">Consciousness Level</h4>
                                        <div className="relative w-48 h-48 mx-auto">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle className="text-white/10" strokeWidth="12" stroke="currentColor" fill="transparent" r="84" cx="96" cy="96" />
                                                <circle
                                                    stroke="url(#consciousness-gradient)"
                                                    fill="transparent"
                                                    strokeWidth="12"
                                                    strokeDasharray={2 * Math.PI * 84}
                                                    strokeLinecap="round" r="84" cx="96" cy="96"
                                                    style={{
                                                        strokeDashoffset: (2 * Math.PI * 84) - (consciousness.displayLevel / 100) * (2 * Math.PI * 84),
                                                        transition: 'stroke-dashoffset 1s ease-in-out'
                                                    }}
                                                />
                                                <defs>
                                                    <linearGradient id="consciousness-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                        <stop offset="0%" stopColor="#9b59b6" />
                                                        <stop offset="100%" stopColor="#4ecdc4" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                <span className="text-5xl font-mono text-white">{consciousness.displayLevel.toFixed(0)}</span>
                                                <span className="text-lg text-gray-400">%</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400">Your current level of quantum consciousness alignment.</p>
                                        <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                                            <div>
                                                <h4 className="font-bold text-white">Field Synchronization</h4>
                                                <p className="text-xs text-gray-400">Sync analyzer field with your consciousness level.</p>
                                            </div>
                                            <Button onClick={() => setConsciousnessSync(!consciousnessSync)} variant={consciousnessSync ? 'default' : 'outline'} className={consciousnessSync ? 'bg-[#9b59b6]' : 'border-white/20'}>
                                                {consciousnessSync ? 'Enabled' : 'Disabled'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </motion.div>
        )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default QuantumResonanceFieldAnalyzer;