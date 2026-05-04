import { Injectable, signal, computed, OnDestroy, untracked } from '@angular/core';
import { CountInStatus } from '../../../app/modules/tap-rythm/interface/flat.interface';

@Injectable({
  providedIn: 'root',
})
export class MetronomeService implements OnDestroy {
  private _audioCtx: AudioContext | null = null;
  private _worker: Worker | null = null;

  // -- State Signals --
  private readonly _bpm = signal<number>(120);
  private readonly _originalBpm = signal<number>(120);
  private readonly _isPlaying = signal<boolean>(false);
  private readonly _timeInMeasure = signal<number>(4); // Signature numerator
  private readonly _timeBeatType = signal<number>(4);  // Signature denominator
  private readonly _subdivision = signal<number>(1);   // 1=quarter, 2=eighth, etc.
  private readonly _isShuffle = signal<boolean>(false);
  private readonly _accentFirstBeat = signal<boolean>(true);
  private readonly _currentBeat = signal<number>(-1);
  
  // -- Count In Specific Status (for TapRythm) --
  private readonly _countInStatus = signal<CountInStatus>('not-started');
  private readonly _metronomeTick = signal<number>(1);
  private readonly _exerciseStartAudioTime = signal<number>(0);

  // -- Public Readonly Accessors --
  readonly bpm = this._bpm.asReadonly();
  readonly originalBpm = this._originalBpm.asReadonly();
  readonly isPlaying = this._isPlaying.asReadonly();
  readonly timeInMeasure = this._timeInMeasure.asReadonly();
  readonly timeBeatType = this._timeBeatType.asReadonly();
  readonly subdivision = this._subdivision.asReadonly();
  readonly isShuffle = this._isShuffle.asReadonly();
  readonly accentFirstBeat = this._accentFirstBeat.asReadonly();
  readonly currentBeat = this._currentBeat.asReadonly();
  readonly countInStatus = this._countInStatus.asReadonly();
  readonly metronomeTick = this._metronomeTick.asReadonly();
  readonly exerciseStartAudioTime = this._exerciseStartAudioTime.asReadonly();

  get audioContext(): AudioContext | null {
    return this._audioCtx;
  }

  // -- Audio logic properties --
  private readonly _scheduleAheadTime = 0.1;
  private _nextNoteTime = 0.0;
  private _currentNoteInMeasure = 0;
  
  private readonly FREQ_STRONG = 987.767;
  private readonly FREQ_WEAK = 783.991;

  // Callback for Count In completion
  private _onCountInComplete: (() => void) | null = null;

  constructor() {
    this._initWorker();
  }

  private _initWorker(): void {
    try {
      this._worker = new Worker(new URL('./metronome.worker', import.meta.url));
      this._worker.onmessage = ({ data }) => {
        if (data === 'tick') this._scheduler();
      };
    } catch (e) {
      console.error('[MetronomeService]: Failed to initialize worker', e);
    }
  }

  // -- Core Controls --

  togglePlay(): void {
    this.isPlaying() ? this.stop() : this.start();
  }

  start(): void {
    if (this._isPlaying()) return;
    
    if (!this._audioCtx) {
      this._audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (this._audioCtx.state === 'suspended') {
      this._audioCtx.resume();
    }
    
    this._isPlaying.set(true);
    this._currentNoteInMeasure = 0;
    this._nextNoteTime = this._audioCtx.currentTime;
    this._worker?.postMessage('start');
  }

  stop(): void {
    this._isPlaying.set(false);
    this._worker?.postMessage('stop');
    this._currentBeat.set(-1);
    this._countInStatus.set('not-started');
  }

  reset(): void {
    this.stop();
    this._metronomeTick.set(1);
    this._countInStatus.set('not-started');
  }

  private _silentCountIn: boolean = false;

  // -- Count In Logic (TapRythm) --

  startCountIn(onComplete: () => void, silent: boolean = false): void {
    this._onCountInComplete = onComplete;
    this._countInStatus.set('play');
    this._metronomeTick.set(1);
    this._silentCountIn = silent;
    
    // Reset internal beat tracker to align with count in
    this._currentNoteInMeasure = 0;
    
    // We start the metronome audio/scheduler as well for the count-in
    this.start();
  }

  // -- Scheduler logic --

  private _scheduler(): void {
    while (this._audioCtx && this._nextNoteTime < this._audioCtx.currentTime + this._scheduleAheadTime) {
      this._scheduleNote(this._currentNoteInMeasure, this._nextNoteTime);
      this._advanceNextNote();
    }
  }

  private _advanceNextNote(): void {
    const secondsPerBeat = 60.0 / this._bpm();
    // Adjust based on beat type (denominator)
    // ratio: 4 -> 1, 2 -> 2, 8 -> 0.5
    const ratio = this._timeBeatType() === 2 ? 2 : (this._timeBeatType() === 8 ? 0.5 : 1);
    
    this._nextNoteTime += ((secondsPerBeat * ratio) / this._subdivision());
    
    this._currentNoteInMeasure++;
    if (this._currentNoteInMeasure === this._timeInMeasure() * this._subdivision()) {
      this._currentNoteInMeasure = 0;
    }
  }

  private _scheduleNote(beatInMeasure: number, time: number): void {
    if (!this._audioCtx) return;
    
    const isMajorBeat = beatInMeasure % this._subdivision() === 0;
    const beatIndex = Math.floor(beatInMeasure / this._subdivision());
    const isStrong = beatIndex === 0 && isMajorBeat;

    // Shuffle skip logic
    if (this._isShuffle() && this._subdivision() === 3 && (beatInMeasure % 3 === 1)) {
       return;
    }
    
    // Update visual and logical state
    if (isMajorBeat) {
      this._currentBeat.set(beatIndex);
      
      // Handle Count-In Tick Sync
      if (this._countInStatus() === 'play') {
          untracked(() => {
            const currentTick = beatIndex + 1;
            this._metronomeTick.set(currentTick);
            
            if (currentTick === this._timeInMeasure()) {
                // Le premier temps de l'exercice sera exactement au temps de la prochaine note
                const secondsPerBeat = 60.0 / this._bpm();
                const ratio = this._timeBeatType() === 2 ? 2 : (this._timeBeatType() === 8 ? 0.5 : 1);
                const nextNoteTime = time + ((secondsPerBeat * ratio) / this._subdivision());
                
                this._exerciseStartAudioTime.set(nextNoteTime);

                // Done with count-in
                setTimeout(() => {
                    this._countInStatus.set('finish');
                    this._onCountInComplete?.();
                    this._onCountInComplete = null;
                }, 0);
            }
          });
      }
    }

    if (this._silentCountIn && this._countInStatus() === 'play') {
      return;
    }

    const osc = this._audioCtx.createOscillator();
    const env = this._audioCtx.createGain();

    osc.frequency.value = (isStrong && this._accentFirstBeat()) ? this.FREQ_STRONG : this.FREQ_WEAK;
    
    const volume = !isMajorBeat ? 0.1 : (isStrong ? 0.7 : 0.35);
    
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(volume, time + 0.005);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(env);
    env.connect(this._audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  // -- Configuration API --

  setBpm(value: number): void {
    this._bpm.set(Math.min(Math.max(value, 20), 320));
  }

  setOriginalBpm(value: number): void {
      this._originalBpm.set(value);
  }

  setSignature(value: number): void {
    this._timeInMeasure.set(Math.min(Math.max(value, 1), 16));
  }

  setTimeSignature(value: number): void {
    this.setSignature(value);
  }

  setTimeBeatType(value: number): void {
      this._timeBeatType.set(value);
  }

  setSubdivision(value: number): void {
    this._subdivision.set(value);
  }

  setShuffle(active: boolean): void {
    this._isShuffle.set(active);
  }

  setAccent(active: boolean): void {
    this._accentFirstBeat.set(active);
  }

  ngOnDestroy(): void {
    this.stop();
    this._worker?.terminate();
    this._audioCtx?.close();
  }
}
