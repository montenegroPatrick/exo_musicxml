import { Injectable, signal, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MetronomeService implements OnDestroy {
  private audioCtx: AudioContext | null = null;
  private worker: Worker | null = null;
  
  // State Signals
  readonly bpm = signal(120);
  readonly isPlaying = signal(false);
  readonly timeInMeasure = signal(4);
  readonly subdivision = signal(1); // 1 = quarter, 2 = eighth, 4 = sixteenth, 3 = triplet
  readonly isShuffle = signal(false);
  readonly accentFirstBeat = signal(true);
  readonly currentBeat = signal(-1);
  
  // Audio Config
  private readonly scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
  private nextNoteTime = 0.0; // When the next note is due.
  private currentNoteInMeasure = 0; // Current note number in the measure
  
  // Frequencies from legacy
  private readonly FREQ_STRONG = 987.767; // B5
  private readonly FREQ_WEAK = 783.991; // G5
  
  constructor() {
    this.initWorker();
  }

  private initWorker() {
    // Angular standard Worker initialization
    this.worker = new Worker(new URL('./metronome.worker', import.meta.url));
    this.worker.onmessage = ({ data }) => {
      if (data === 'tick') {
        this.scheduler();
      }
    };
  }

  togglePlay() {
    if (this.isPlaying()) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    if (this.isPlaying()) return;
    
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    
    // Ensure the AudioContext is resumed (browser policy)
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    
    this.isPlaying.set(true);
    this.currentNoteInMeasure = 0;
    this.nextNoteTime = this.audioCtx.currentTime;
    this.worker?.postMessage('start');
  }

  stop() {
    this.isPlaying.set(false);
    this.worker?.postMessage('stop');
    this.currentBeat.set(-1);
  }

  private scheduler() {
    // While there are notes that will need to play before the next interval, schedule them
    while (this.audioCtx && this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentNoteInMeasure, this.nextNoteTime);
      this.nextNote();
    }
  }

  private nextNote() {
    const secondsPerBeat = 60.0 / this.bpm();
    // subdivision() determines if we're scheduling 8th, 16th notes, etc.
    this.nextNoteTime += (secondsPerBeat / this.subdivision());
    
    this.currentNoteInMeasure++;
    // Reset measure counter
    if (this.currentNoteInMeasure === this.timeInMeasure() * this.subdivision()) {
      this.currentNoteInMeasure = 0;
    }
  }

  private scheduleNote(beatNumber: number, time: number) {
    if (!this.audioCtx) return;
    
    const isStrong = beatNumber === 0;
    const isSubdivision = beatNumber % this.subdivision() !== 0;

    // Shuffle logic: Skip the middle note of the triplet (index 1 mod 3)
    if (this.isShuffle() && this.subdivision() === 3 && (beatNumber % 3 === 1)) {
       return;
    }
    
    // UI Feedback: Only update currentBeat on the main beats (integers)
    if (!isSubdivision) {
      // Use setTimeout to avoid 'ExpressionChangedAfterItHasBeenCheckedError' if signal is read in template
      // or just set it since it's a Signal and Angular handles it.
      this.currentBeat.set(beatNumber / this.subdivision());
    }

    const osc = this.audioCtx.createOscillator();
    const envelope = this.audioCtx.createGain();

    // Frequency logic: Strong beat vs Regular beat
    osc.frequency.value = (isStrong && this.accentFirstBeat()) ? this.FREQ_STRONG : this.FREQ_WEAK;
    
    // Volume logic
    const volume = isSubdivision ? 0.15 : (isStrong ? 0.8 : 0.4);
    
    envelope.gain.setValueAtTime(0, time);
    envelope.gain.linearRampToValueAtTime(volume, time + 0.005);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

    osc.connect(envelope);
    envelope.connect(this.audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  setBpm(value: number) {
    const safeBpm = Math.min(Math.max(value, 20), 300);
    this.bpm.set(safeBpm);
  }

  setSignature(value: number) {
    this.timeInMeasure.set(value);
  }

  setSubdivision(value: number) {
    this.subdivision.set(value);
  }

  ngOnDestroy() {
    this.stop();
    this.worker?.terminate();
    this.audioCtx?.close();
  }
}
