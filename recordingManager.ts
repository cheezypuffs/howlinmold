// Recording manager for audio export functionality
export interface RecordingState {
  isRecording: boolean;
  duration: number;
  recordedBlob: Blob | null;
}

export class RecordingManager {
  private audioContext: AudioContext;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private inputNode: AudioNode;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private startTime: number = 0;
  private timerInterval: any = null;
  private recordingState: RecordingState = {
    isRecording: false,
    duration: 0,
    recordedBlob: null,
  };
  
  private onStateChangeCallback?: (state: RecordingState) => void;
  
  constructor(audioContext: AudioContext, inputNode: AudioNode) {
    this.audioContext = audioContext;
    this.inputNode = inputNode;
  }
  
  setStateChangeCallback(callback: (state: RecordingState) => void) {
    this.onStateChangeCallback = callback;
  }
  
  private updateState(updates: Partial<RecordingState>) {
    this.recordingState = { ...this.recordingState, ...updates };
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.recordingState);
    }
  }
  
  async startRecording(): Promise<void> {
    try {
      this.destinationNode = this.audioContext.createMediaStreamDestination();
      this.inputNode.connect(this.destinationNode);
      
      const stream = this.destinationNode.stream;
      
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
      }
      
      this.mediaRecorder = new MediaRecorder(stream, { mimeType });
      this.recordedChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(this.recordedChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
        this.updateState({ isRecording: false, recordedBlob });
        if(this.timerInterval) clearInterval(this.timerInterval);
      };
      
      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.updateState({ isRecording: false });
        if(this.timerInterval) clearInterval(this.timerInterval);
      };
      
      this.mediaRecorder.start();
      this.startTime = Date.now();
      
      this.updateState({ isRecording: true, duration: 0, recordedBlob: null });
      this.startDurationTimer();
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }
  
  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    if (this.destinationNode) {
      try {
        this.inputNode.disconnect(this.destinationNode);
      } catch (e) {
        // Ignore disconnect errors
      }
      this.destinationNode = null;
    }
  }
  
  private startDurationTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
        if (this.recordingState.isRecording) {
            const duration = (Date.now() - this.startTime) / 1000;
            this.updateState({ duration });
        } else {
            clearInterval(this.timerInterval);
        }
    }, 100);
  }
  
  async downloadRecording(filename: string = 'groove-recording'): Promise<void> {
    if (!this.recordingState.recordedBlob) {
      throw new Error('No recording available');
    }
    
    const finalBlob = this.recordingState.recordedBlob;
    const extension = finalBlob.type.includes('mp4') ? 'm4a' : 'webm';
    const finalFilename = `${filename}.${extension}`;
    
    const url = URL.createObjectURL(finalBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = finalFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  getRecordingState(): RecordingState {
    return { ...this.recordingState };
  }
  
  hasRecording(): boolean {
    return this.recordingState.recordedBlob !== null;
  }
  
  clearRecording(): void {
    this.updateState({ recordedBlob: null, duration: 0 });
    this.recordedChunks = [];
  }
  
  destroy(): void {
    this.stopRecording();
    this.clearRecording();
    this.mediaRecorder = null;
    this.onStateChangeCallback = undefined;
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}