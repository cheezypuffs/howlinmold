import type { SynthSettings, WaveformType } from '../../../types';
import { initialSettings } from '../Synth';

class Voice {
    private ctx: AudioContext;
    public isPlaying = true;
    public note: number;
    private settings: SynthSettings;

    // Nodes
    private vca: GainNode;
    private oscA: OscillatorNode;
    private oscAGain: GainNode;
    private oscB: OscillatorNode;
    private oscBGain: GainNode;
    private noise: AudioBufferSourceNode;
    private noiseGain: GainNode;
    private filter: BiquadFilterNode;

    constructor(ctx: AudioContext, noteNumber: number, velocity: number, settings: SynthSettings, destination: AudioNode) {
        this.ctx = ctx;
        this.note = noteNumber;
        this.settings = settings;

        // VCA - final output gain for this voice
        this.vca = ctx.createGain();
        this.vca.gain.value = 0; // Start silent
        this.vca.connect(destination);

        // Filter
        this.filter = ctx.createBiquadFilter();
        this.filter.connect(this.vca);

        // Oscillator A
        this.oscA = ctx.createOscillator();
        this.oscAGain = ctx.createGain();
        this.oscA.connect(this.oscAGain).connect(this.filter);
        
        // Oscillator B
        this.oscB = ctx.createOscillator();
        this.oscBGain = ctx.createGain();
        this.oscB.connect(this.oscBGain).connect(this.filter);

        // Noise Source
        const bufferSize = ctx.sampleRate * 2; // 2 seconds of white noise
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        this.noise = ctx.createBufferSource();
        this.noise.buffer = buffer;
        this.noise.loop = true;
        this.noiseGain = ctx.createGain();
        this.noise.connect(this.noiseGain).connect(this.filter);

        this.updateSettings(settings, true);

        this.oscA.start();
        this.oscB.start();
        this.noise.start();
        
        this.noteOn(velocity);
    }

    private midiToFreq(midi: number, coarse: number, fine: number) {
        const totalShift = coarse * 12 + fine;
        return 440 * Math.pow(2, (midi + totalShift - 69) / 12);
    }

    updateSettings(settings: SynthSettings, isInitial = false) {
        this.settings = settings;
        const now = this.ctx.currentTime;
        const rampTime = isInitial ? 0 : 0.01;

        // Oscillators
        this.oscA.type = (settings.osc_a_waveform === 'pulse' ? 'square' : settings.osc_a_waveform) as OscillatorType;
        this.oscA.frequency.setTargetAtTime(this.midiToFreq(this.note + settings.osc_a_octave * 12, settings.osc_a_coarse_tune, settings.osc_a_fine_tune), now, rampTime);
        if (settings.osc_a_waveform === 'pulse' || settings.osc_a_waveform === 'square') {
            (this.oscA as any).width?.setTargetAtTime(settings.osc_a_pulse_width, now, rampTime);
        }

        this.oscB.type = (settings.osc_b_waveform === 'pulse' ? 'square' : settings.osc_b_waveform) as OscillatorType;
        this.oscB.frequency.setTargetAtTime(this.midiToFreq(this.note + settings.osc_b_octave * 12, settings.osc_b_coarse_tune, settings.osc_b_fine_tune), now, rampTime);
        if (settings.osc_b_waveform === 'pulse' || settings.osc_b_waveform === 'square') {
            (this.oscB as any).width?.setTargetAtTime(settings.osc_b_pulse_width, now, rampTime);
        }

        // Mixer
        this.oscAGain.gain.setTargetAtTime(settings.mixer_osc_a_level, now, rampTime);
        this.oscBGain.gain.setTargetAtTime(settings.mixer_osc_b_level, now, rampTime);
        this.noiseGain.gain.setTargetAtTime(settings.mixer_noise_level, now, rampTime);
        
        // Filter
        this.filter.type = settings.filter_type === 'lp_4' ? 'lowpass' : settings.filter_type === 'lp_2' ? 'lowpass' : settings.filter_type === 'hp_2' ? 'highpass' : 'bandpass';
        if (settings.filter_type === 'lp_4') { this.filter.Q.setTargetAtTime(1, now, rampTime); } // No native 4-pole, this is a simplification
        else { this.filter.Q.setTargetAtTime(settings.filter_resonance, now, rampTime); }
        this.filter.frequency.setTargetAtTime(settings.filter_cutoff, now, rampTime);
        this.filter.Q.setTargetAtTime(settings.filter_resonance, now, rampTime);
    }
    
    noteOn(velocity: number) {
        const now = this.ctx.currentTime;
        
        // --- Amp Env (VCA) ---
        const vcaGain = this.vca.gain;
        vcaGain.cancelScheduledValues(now);
        vcaGain.setValueAtTime(vcaGain.value, now);
        vcaGain.linearRampToValueAtTime(velocity, now + this.settings.env_2_attack);
        vcaGain.linearRampToValueAtTime(this.settings.env_2_sustain * velocity, now + this.settings.env_2_attack + this.settings.env_2_decay);

        // --- Filter Env ---
        const filterFreq = this.filter.frequency;
        filterFreq.cancelScheduledValues(now);
        filterFreq.setValueAtTime(filterFreq.value, now);
        
        const attackTarget = this.settings.filter_cutoff + this.settings.filter_env_1_amount;
        filterFreq.linearRampToValueAtTime(attackTarget, now + this.settings.env_1_attack);
        
        const sustainTarget = this.settings.filter_cutoff + (this.settings.filter_env_1_amount * this.settings.env_1_sustain);
        filterFreq.linearRampToValueAtTime(sustainTarget, now + this.settings.env_1_attack + this.settings.env_1_decay);
    }

    noteOff() {
        if (!this.isPlaying) return;
        const now = this.ctx.currentTime;
        this.isPlaying = false;

        // VCA release
        const vcaGain = this.vca.gain;
        vcaGain.cancelScheduledValues(now);
        vcaGain.setValueAtTime(vcaGain.value, now);
        vcaGain.linearRampToValueAtTime(0.0001, now + this.settings.env_2_release);

        // Filter release
        const filterFreq = this.filter.frequency;
        filterFreq.cancelScheduledValues(now);
        filterFreq.setValueAtTime(filterFreq.value, now);
        filterFreq.linearRampToValueAtTime(this.settings.filter_cutoff, now + this.settings.env_1_release);
        
        const stopTime = now + Math.max(this.settings.env_2_release, this.settings.env_1_release) + 0.1;

        try { this.oscA.stop(stopTime); } catch(e) {}
        try { this.oscB.stop(stopTime); } catch(e) {}
        try { this.noise.stop(stopTime); } catch(e) {}

        setTimeout(() => {
            try { this.vca.disconnect(); } catch(e){}
            try { this.filter.disconnect(); } catch(e){}
            try { this.oscAGain.disconnect(); } catch(e){}
            try { this.oscBGain.disconnect(); } catch(e){}
            try { this.noiseGain.disconnect(); } catch(e){}
        }, (stopTime - now) * 1000 + 50);
    }
}


export class SynthEngine {
    public ctx: AudioContext;
    private output: GainNode;
    private activeVoice: Voice | null = null;
    private settings: SynthSettings = initialSettings;

    constructor(ctx: AudioContext) {
        this.ctx = ctx;
        this.output = this.ctx.createGain();
        this.output.gain.value = this.settings.master_volume;
    }

    public noteOn(noteNumber: number, velocity: number) {
        if (this.activeVoice) {
            this.activeVoice.noteOff();
        }
        this.activeVoice = new Voice(this.ctx, noteNumber, velocity, this.settings, this.output);
    }

    public noteOff(noteNumber: number) {
        if (this.activeVoice && this.activeVoice.note === noteNumber) {
            this.activeVoice.noteOff();
            this.activeVoice = null;
        }
    }
    
    public updateAllSettings(settings: SynthSettings) {
        this.settings = settings;
        this.output.gain.setTargetAtTime(this.settings.master_volume, this.ctx.currentTime, 0.01);
        if(this.activeVoice && this.activeVoice.isPlaying) {
            this.activeVoice.updateSettings(settings);
        }
    }

    public getOutputNode(): AudioNode {
        return this.output;
    }

    public destroy() {
        this.output.disconnect();
    }
}
