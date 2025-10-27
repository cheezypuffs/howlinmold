// audio/workerFactory.ts

/**
 * Creates a waveform worker with a robust, multi-stage fallback strategy.
 * This ensures the application can take advantage of modern module workers
 * while remaining resilient to cross-origin errors and other environmental issues.
 * @param debug - If true, forces the function to skip to the Blob fallback for testing.
 * @returns A Worker instance or null if all attempts fail. Never throws.
 */
export function createWaveformWorker(debug = false): Worker | null {
  const isDev = process.env.NODE_ENV === 'development';

  if (debug) {
    console.warn('[WorkerFactory] Debug mode enabled, forcing Blob fallback.');
    try {
      const blobSrc = `self.onmessage = () => postMessage({ error:'blob-fallback: waveform not available' });`;
      const blob = new Blob([blobSrc], { type: 'application/javascript' });
      return new Worker(URL.createObjectURL(blob));
    } catch (errC) {
      console.error('[HowlinMold] All worker constructors failed, including debug Blob:', errC);
      return null;
    }
  }

  // A) Attempt absolute, same-origin classic worker first (most reliable)
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    if (!origin) {
      throw new Error('Could not determine window origin to construct worker path.');
    }
    const workerUrl = `${origin}/workers/waveform.worker.js`;
    if (isDev) {
      console.debug('[WorkerFactory] Attempting to create classic worker from absolute URL:', workerUrl);
    }
    // Validate the URL before trying to use it
    new URL(workerUrl);
    const worker = new Worker(workerUrl, { type: 'classic' });
    console.log('[WorkerFactory] Successfully created classic worker.');
    return worker;
  } catch (errA) {
    console.warn('[WorkerFactory] Classic worker (primary) failed to create. Falling back to module worker.', errA);
    if (isDev) {
      if (errA instanceof DOMException && errA.name === 'SecurityError') {
        console.error('[WorkerFactory] SecurityError: This is a cross-origin issue. Ensure the worker is served from the same origin or check CSP policies.');
      }
    }
  }
  
  // B) Fallback to Module Worker
  try {
    // @ts-ignore - import.meta.url is a standard but may show TS errors depending on config
    const workerUrl = new URL('../workers/waveform.worker.ts', import.meta.url);
    if (isDev) {
      console.debug('[WorkerFactory] Attempting module worker fallback from:', workerUrl.href);
    }
    const worker = new Worker(workerUrl, { type: 'module' });
    console.log('[WorkerFactory] Successfully created module worker as fallback.');
    return worker;
  } catch (errB) {
    console.warn('[WorkerFactory] Module worker fallback failed. Trying final Blob fallback.', errB);
  }

  // C) Blob fallback (minimal handler, ensures app doesn't crash)
  try {
    const blobSrc = `self.onmessage = () => postMessage({ error:'blob-fallback: waveform not available' });`;
    const blob = new Blob([blobSrc], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    console.warn('[WorkerFactory] All primary methods failed. Using Blob fallback worker.');
    return worker;
  } catch (errC) {
    console.error('[HowlinMold] All worker constructors failed:', errC);
    return null;
  }
}