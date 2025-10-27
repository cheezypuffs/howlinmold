// Base drum sounds
export const playKick = (ctx: AudioContext, destination: AudioNode) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
  
  gain.gain.setValueAtTime(1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  
  osc.connect(gain);
  gain.connect(destination);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.5);
};

export const playSnare = (ctx: AudioContext, destination: AudioNode) => {
  const noise = ctx.createBufferSource();
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  
  const gain = ctx.createGain();
  
  // Fill buffer with noise
  for (let i = 0; i < noiseBuffer.length; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }
  
  noise.buffer = noiseBuffer;
  
  gain.gain.setValueAtTime(1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  
  noise.connect(gain);
  gain.connect(destination);
  
  noise.start(ctx.currentTime);
};

export const playHiHat = (ctx: AudioContext, destination: AudioNode) => {
  const noise = ctx.createBufferSource();
  const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  
  const gain = ctx.createGain();
  const highpass = ctx.createBiquadFilter();
  
  // Fill buffer with noise
  for (let i = 0; i < noiseBuffer.length; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }
  
  noise.buffer = noiseBuffer;
  
  highpass.type = "highpass";
  highpass.frequency.value = 8000;
  
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
  
  noise.connect(highpass);
  highpass.connect(gain);
  gain.connect(destination);
  
  noise.start(ctx.currentTime);
};
