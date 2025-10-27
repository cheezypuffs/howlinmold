import type { SynthSettings } from "../../../types";

type FxSettings = Pick<SynthSettings, 'fx_distortion_drive' | 'fx_distortion_tone' | 'fx_chorus_rate' | 'fx_chorus_depth' | 'fx_delay_mode' | 'fx_delay_time' | 'fx_delay_feedback' | 'fx_delay_mix' | 'fx_reverb_decay' | 'fx_reverb_mix'>;

export class EffectsProcessor {
    private input: GainNode;
    public output: GainNode;

    // Distortion
    private distNode: WaveShaperNode;
    private distTone: BiquadFilterNode;

    // Chorus
    private chorusDelay: DelayNode;
    private chorusLFO: OscillatorNode;
    private chorusLfoGain: GainNode;
    private chorusDry: GainNode;
    private chorusWet: GainNode;
    
    // Delay
    private delayNode: DelayNode;
    private delayFeedback: GainNode;
    private delayFilter: BiquadFilterNode;
    private delayDry: GainNode;
    private delayWet: GainNode;

    // Reverb
    private reverbNode: ConvolverNode;
    private reverbDry: GainNode;
    private reverbWet: GainNode;

    constructor(private context: AudioContext) {
        this.input = context.createGain();
        let lastNode: AudioNode = this.input;

        // --- Distortion ---
        this.distNode = context.createWaveShaper();
        this.distTone = context.createBiquadFilter(); this.distTone.type = 'lowpass';
        lastNode.connect(this.distNode).connect(this.distTone);
        lastNode = this.distTone;

        // --- Chorus ---
        this.chorusDry = context.createGain();
        this.chorusWet = context.createGain();
        const chorusOutput = context.createGain();
        this.chorusDelay = context.createDelay(0.1);
        this.chorusLFO = context.createOscillator(); this.chorusLFO.type = 'sine';
        this.chorusLfoGain = context.createGain();
        this.chorusLFO.connect(this.chorusLfoGain).connect(this.chorusDelay.delayTime);
        this.chorusLFO.start();
        lastNode.connect(this.chorusDry).connect(chorusOutput);
        lastNode.connect(this.chorusDelay).connect(this.chorusWet).connect(chorusOutput);
        lastNode = chorusOutput;

        // --- Delay ---
        this.delayDry = context.createGain();
        this.delayWet = context.createGain();
        this.delayNode = context.createDelay(2.0);
        this.delayFeedback = context.createGain();
        this.delayFilter = context.createBiquadFilter(); this.delayFilter.type = 'lowpass';
        lastNode.connect(this.delayDry);
        lastNode.connect(this.delayWet).connect(this.delayNode);
        this.delayNode.connect(this.delayFilter).connect(this.delayFeedback).connect(this.delayNode);
        const delayOutput = context.createGain();
        this.delayDry.connect(delayOutput);
        this.delayNode.connect(delayOutput);
        lastNode = delayOutput;

        // --- Reverb ---
        this.reverbDry = context.createGain();
        this.reverbWet = context.createGain();
        this.reverbNode = context.createConvolver();
        lastNode.connect(this.reverbDry);
        lastNode.connect(this.reverbWet).connect(this.reverbNode);
        this.output = context.createGain();
        this.reverbDry.connect(this.output);
        this.reverbNode.connect(this.output);
    }
    
    public getInputNode(): GainNode { return this.input; }
    public getOutputNode(): GainNode { return this.output; }

    public updateAllSettings(settings: FxSettings) {
        const now = this.context.currentTime;
        
        // Distortion
        const drive = settings.fx_distortion_drive;
        const curve = new Float32Array(4096);
        const k = drive * 100;
        for (let i = 0; i < 4096; i++) {
            const x = (i * 2) / 4095 - 1;
            curve[i] = ((3 + k) * x * 20 * (Math.PI/180)) / (Math.PI + k * Math.abs(x));
        }
        this.distNode.curve = curve;
        this.distTone.frequency.setTargetAtTime(settings.fx_distortion_tone, now, 0.01);

        // Chorus
        this.chorusLFO.frequency.setTargetAtTime(settings.fx_chorus_rate, now, 0.01);
        this.chorusLfoGain.gain.setTargetAtTime(0.005, now, 0.01); // Fixed LFO depth
        const mix = settings.fx_chorus_depth;
        this.chorusDry.gain.setTargetAtTime(1 - mix, now, 0.01); 
        this.chorusWet.gain.setTargetAtTime(mix, now, 0.01);

        // Delay
        this.delayDry.gain.setTargetAtTime(1 - settings.fx_delay_mix, now, 0.01);
        this.delayWet.gain.setTargetAtTime(settings.fx_delay_mix, now, 0.01);
        this.delayNode.delayTime.setTargetAtTime(settings.fx_delay_time, now, 0.01);
        this.delayFeedback.gain.setTargetAtTime(settings.fx_delay_feedback, now, 0.01);
        this.delayFilter.frequency.setTargetAtTime(settings.fx_delay_mode === 'tape' ? 3000 : 20000, now, 0.01);
        this.delayFilter.Q.setTargetAtTime(settings.fx_delay_mode === 'tape' ? 1.5 : 0, now, 0.01);

        // Reverb
        this.reverbDry.gain.setTargetAtTime(1 - settings.fx_reverb_mix, now, 0.01);
        this.reverbWet.gain.setTargetAtTime(settings.fx_reverb_mix, now, 0.01);
        if (this.reverbNode.buffer === null || this.reverbNode.buffer.duration !== settings.fx_reverb_decay) {
            this.reverbNode.buffer = this.createReverbImpulse(settings.fx_reverb_decay);
        }
    }

    private createReverbImpulse(decay: number): AudioBuffer {
        const sr = this.context.sampleRate;
        const len = sr * Math.max(0.1, decay);
        const impulse = this.context.createBuffer(2, len, sr);
        for(let c = 0; c < 2; c++) {
            const chan = impulse.getChannelData(c);
            for(let i = 0; i < len; i++) {
                chan[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
            }
        }
        return impulse;
    }

    public destroy() {
        this.chorusLFO.stop();
        this.input.disconnect();
    }
}