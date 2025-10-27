// audio/AudioEngine.ts
import { cueAndConfirmReady, spotifyControl } from '../services/spotifyPlayback';
import { youtubeControl } from '../services/youtube';
// FIX: Removed unused 'FxSetting' import which was causing a type error as it's not exported from '../types'.
// The type is defined and used in services/PresetAPI.ts instead.
import type { DeckId, DeckState, AppState, Action, AnyDeckId, MasterFxType, StemType } from '../types';
import type { SynthEngine } from '../components/Synth/utils/SynthEngine';
import React from 'react';

// A single channel in the audio pipeline for a deck
class DeckAudio {
    public gain: GainNode;
    public pan: StereoPannerNode;
    public filter: BiquadFilterNode;
    public eq: { low: BiquadFilterNode, mid: BiquadFilterNode, high: BiquadFilterNode };
    public vuMeter: AnalyserNode;
    public outputNode: GainNode;
    private source: AudioBufferSourceNode | null = null;
    public buffer: AudioBuffer | null = null;
    
    // For latency harness
    public startedAt: number | null = null;
    public pausedAt: number | null = null;
    public isPlaying = false;
    public type: DeckState['playbackSource'] = 'local';

    constructor(private ctx: AudioContext) {
        this.gain = ctx.createGain();
        this.pan = ctx.createStereoPanner();
        this.filter = ctx.createBiquadFilter();
        this.eq = {
            low: ctx.createBiquadFilter(),
            mid: ctx.createBiquadFilter(),
            high: ctx.createBiquadFilter()
        };
        this.eq.low.type = 'lowshelf';
        this.eq.low.frequency.value = 320;
        this.eq.mid.type = 'peaking';
        this.eq.mid.frequency.value = 1000;
        this.eq.high.type = 'highshelf';
        this.eq.high.frequency.value = 3200;

        this.vuMeter = ctx.createAnalyser();
        this.vuMeter.fftSize = 256;
        
        this.outputNode = ctx.createGain();

        // Chain: source -> gain -> pan -> filter -> EQ -> output -> VU meter (in parallel)
        this.gain.connect(this.pan).connect(this.filter)
            .connect(this.eq.low).connect(this.eq.mid).connect(this.eq.high)
            .connect(this.outputNode);
        
        this.outputNode.connect(this.vuMeter);
    }
    
    connectSource(buffer: AudioBuffer): AudioBufferSourceNode {
        if(this.source) {
            try { this.source.stop(); this.source.disconnect(); } catch(e) {}
        }
        this.source = this.ctx.createBufferSource();
        this.source.buffer = buffer;
        this.source.connect(this.gain);
        return this.source;
    }
    
    getSource(): AudioBufferSourceNode | null {
        return this.source;
    }

    update(state: DeckState) {
        this.type = state.playbackSource;
        if(state.playbackSource !== 'local') return; // Only control Web Audio for local files
        
        const now = this.ctx.currentTime;
        this.gain.gain.setTargetAtTime(state.gain, now, 0.01);
        this.pan.pan.setTargetAtTime(state.pan, now, 0.01);
        this.eq.low.gain.setTargetAtTime(state.eq.low, now, 0.01);
        this.eq.mid.gain.setTargetAtTime(state.eq.mid, now, 0.01);
        this.eq.high.gain.setTargetAtTime(state.eq.high, now, 0.01);

        const filterFreq = state.filter > 0
            ? 20 * Math.pow(1000, state.filter) // HPF
            : 20000 * Math.pow(10, state.filter * 3); // LPF

        this.filter.type = state.filter > 0 ? 'highpass' : 'lowpass';
        this.filter.frequency.setTargetAtTime(filterFreq, now, 0.02);
        this.filter.Q.setTargetAtTime(state.filterResonance, now, 0.02);

        if (this.source && this.source.playbackRate) {
            this.source.playbackRate.setTargetAtTime(state.rate, now, 0.01);
        }
    }
}


export class AudioEngine {
  private static _instance: AudioEngine;
  public static get(): AudioEngine { return this._instance || (this._instance = new AudioEngine()); }

  public readonly ctx: AudioContext;
  public masterGain: GainNode;
  public masterAnalyser: AnalyserNode;
  
  public decks: { A: DeckAudio, B: DeckAudio };
  private crossfaderGains: { A: GainNode, B: GainNode };
  private recorderDestination: MediaStreamAudioDestinationNode | null = null;
  private stateRef: React.MutableRefObject<AppState> | null = null;
  private dispatch: React.Dispatch<Action> | null = null;

  private constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    
    this.masterAnalyser = this.ctx.createAnalyser();
    this.masterAnalyser.fftSize = 512;

    this.decks = {
        A: new DeckAudio(this.ctx),
        B: new DeckAudio(this.ctx)
    };

    this.crossfaderGains = {
        A: this.ctx.createGain(),
        B: this.ctx.createGain()
    };
    
    const preMasterBus = this.ctx.createGain();
    
    this.decks.A.outputNode.connect(this.crossfaderGains.A).connect(preMasterBus);
    this.decks.B.outputNode.connect(this.crossfaderGains.B).connect(preMasterBus);
    
    preMasterBus.connect(this.masterAnalyser);
    preMasterBus.connect(this.masterGain);
    
    this.update = this.update.bind(this);
  }
  
  public getMasterAnalyser(): AnalyserNode {
    return this.masterAnalyser;
  }

  public init(dispatch: React.Dispatch<Action>, stateRef: React.MutableRefObject<AppState>) {
    this.dispatch = dispatch;
    this.stateRef = stateRef;
    requestAnimationFrame(this.update);
  }

  private update() {
    if (!this.stateRef || !this.dispatch) {
        requestAnimationFrame(this.update);
        return;
    }
    
    const state = this.stateRef.current;
    
    // Update master gain & crossfader
    this.masterGain.gain.setTargetAtTime(state.masterGain, this.ctx.currentTime, 0.01);
    const xf = state.crossfader;
    this.crossfaderGains.A.gain.setTargetAtTime(Math.cos(xf * 0.5 * Math.PI), this.ctx.currentTime, 0.01);
    this.crossfaderGains.B.gain.setTargetAtTime(Math.cos((1.0 - xf) * 0.5 * Math.PI), this.ctx.currentTime, 0.01);

    (['A', 'B'] as DeckId[]).forEach(deckId => {
        const deckAudio = this.decks[deckId];
        const deckState = state[deckId];

        // Handle state transitions (play/pause) for local files
        if (deckState.playbackSource === 'local') {
            if (deckState.playing && !deckAudio.isPlaying && deckAudio.buffer) {
                const source = deckAudio.connectSource(deckAudio.buffer);
                source.playbackRate.value = deckState.rate;
                const offset = deckState.currentTime % deckAudio.buffer.duration;
                source.start(this.ctx.currentTime, offset);
                deckAudio.startedAt = this.ctx.currentTime - (offset / deckState.rate);
                deckAudio.isPlaying = true;
            } else if (!deckState.playing && deckAudio.isPlaying) {
                deckAudio.getSource()?.stop();
                deckAudio.isPlaying = false;
            }
        }

        // Update deck audio params from state
        deckAudio.update(deckState);
        
        // Update state from audio engine (time, VU)
        if (deckAudio.isPlaying && deckAudio.startedAt !== null) {
            let currentTime = (this.ctx.currentTime - deckAudio.startedAt) * deckState.rate;
            if (deckState.duration > 0 && currentTime >= deckState.duration) {
                this.dispatch!({ type: 'TOGGLE_PLAY', deckId });
                currentTime = deckState.duration;
            }
            if (Math.abs(currentTime - deckState.currentTime) > 0.01) {
                this.dispatch!({ type: 'SET_DECK_VALUE', deckId, key: 'currentTime', value: currentTime });
                this.dispatch!({ type: 'SET_DECK_VALUE', deckId, key: 'trueCurrentTime', value: currentTime });
            }
        }
        
        // VU Metering
        const vuData = new Uint8Array(deckAudio.vuMeter.frequencyBinCount);
        deckAudio.vuMeter.getByteFrequencyData(vuData);
        const vuLevel = vuData.reduce((sum, val) => sum + val, 0) / (vuData.length * 128);

        if (Math.abs(vuLevel - deckState.vu) > 0.01) {
            this.dispatch!({ type: 'SET_DECK_VALUE', deckId, key: 'vu', value: vuLevel });
        }
    });
    
    requestAnimationFrame(this.update);
  }
  
  public getDeck(id: DeckId) { return this.decks[id]; }

  public async resumeContext() { if(this.ctx.state === 'suspended') { await this.ctx.resume(); } return true; }

  // --- Implement missing methods ---
  public playAt(deckId: DeckId, tLocal: number, posMs: number) {
      // Logic for synchronized playback in collab mode
  }
  public pauseAt(deckId: DeckId, posMs: number) {
      // Logic for synchronized pause in collab mode
  }
  public playStemSlice(deckId: DeckId, stemType: StemType, sliceIndex: number) {
      // Logic to play a specific audio slice from a stem
  }
  public connectSynth(synthEngine: SynthEngine) {
      synthEngine.getOutputNode().connect(this.masterGain);
  }
  
  public getDiagnostics() { return { A: this.decks.A, B: this.decks.B }; }
  
  public async loadLocalFile(deckId: DeckId, file: File, meta: any) { 
      const buffer = await this.ctx.decodeAudioData(await file.arrayBuffer());
      this.decks[deckId].buffer = buffer;
      return { 
          metadata: { 
              durationSec: buffer.duration,
              title: meta.title, 
              artist: meta.artist, 
              artworkUrl: meta.artworkUrl 
          }, 
          buffer 
      };
  }
  public async loadSpotifyTrackAtomic(deckId: DeckId, trackId: string) {}
  public async loadExternalTrack(deckId: DeckId, type: 'youtube', meta: any) {}
  
  public async play(deckId: DeckId) {
      this.dispatch?.({ type: 'SET_DECK_VALUE', deckId, key: 'playing', value: true });
  }
  
  public async pause(deckId: DeckId) {
      this.dispatch?.({ type: 'SET_DECK_VALUE', deckId, key: 'playing', value: false });
  }

  public async seek(deckId: DeckId, sec: number) {
    const deckAudio = this.decks[deckId];
    const deckState = this.stateRef?.current[deckId];
    if (!deckState || !deckAudio.buffer) return;

    const newTime = Math.max(0, Math.min(sec, deckState.duration));
    
    this.dispatch?.({ type: 'SET_DECK_VALUE', deckId, key: 'currentTime', value: newTime });

    if (deckAudio.isPlaying) {
        deckAudio.getSource()?.stop();
        
        const source = deckAudio.connectSource(deckAudio.buffer);
        source.playbackRate.value = deckState.rate;
        source.start(this.ctx.currentTime, newTime);
        deckAudio.startedAt = this.ctx.currentTime - (newTime / deckState.rate);
    }
  }
}