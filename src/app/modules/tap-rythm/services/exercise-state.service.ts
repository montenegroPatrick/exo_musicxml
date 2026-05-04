import { computed, inject, Injectable, signal } from '@angular/core';
import { ExerciseStatus, IUserTap, Level } from '../interface/flat.interface';
import { TapEvaluationService } from './tap-evaluation.service';
import { LocalStorageService } from '../../../../core/services/utils/local-storage.service';
import { TapRythmService } from '@app/modules/tap-rythm/services/tap-rythm.service';

@Injectable({
  providedIn: 'root',
})
@Injectable({
  providedIn: 'root',
})
export class ExerciseStateService {
  private readonly _tapEvaluationService = inject(TapEvaluationService);
  private readonly _localStorageService = inject(LocalStorageService);
  private readonly _tapRythmService = inject(TapRythmService);
  
  private readonly _savedSettings = this._localStorageService.loadSettings();

  // -- Private Writable Signals --
  private readonly _nbMeasures = signal<number>(0);
  private readonly _exerciseStatus = signal<ExerciseStatus>('not-started');
  private readonly _userTaps = signal<IUserTap[]>([]);
  private readonly _resultPercentage = signal<number>(0);
  private readonly _isPlaying = signal<boolean>(false);
  private readonly _xmlIsLoaded = signal<boolean>(false);
  private readonly _isListening = signal<boolean>(false);
  
  private readonly _partSound = signal<boolean>(this._savedSettings.partSound);
  private readonly _tapVolume = signal<number>(this._savedSettings.tapVolume);
  private readonly _masterVolume = signal<number>(this._savedSettings.masterVolume);
  private readonly _metronomeVolume = signal<number>(this._savedSettings.metronomeVolume);
  private readonly _level = signal<Level>(this._savedSettings.level);
  private readonly _exerciseMode = signal<boolean>(false);
  private readonly _originalBpm = signal<number>(60);
  private readonly _countInMs = signal<number>(0);
  private readonly _timeSignatureBeats = signal<number>(4);
  private readonly _visualCountInBeat = signal<number>(0);

  // -- Public Readonly Signals --
  readonly nbMeasures = this._nbMeasures.asReadonly();
  readonly exerciseStatus = this._exerciseStatus.asReadonly();
  readonly userTaps = this._userTaps.asReadonly();
  readonly resultPercentage = this._resultPercentage.asReadonly();
  readonly isPlaying = this._isPlaying.asReadonly();
  readonly xmlIsLoaded = this._xmlIsLoaded.asReadonly();
  readonly isListening = this._isListening.asReadonly();
  
  readonly partSound = this._partSound.asReadonly();
  readonly tapVolume = this._tapVolume.asReadonly();
  readonly masterVolume = this._masterVolume.asReadonly();
  readonly metronomeVolume = this._metronomeVolume.asReadonly();
  readonly level = this._level.asReadonly();
  readonly exerciseMode = this._exerciseMode.asReadonly();
  readonly originalBpm = this._originalBpm.asReadonly();
  readonly countInMs = this._countInMs.asReadonly();
  readonly timeSignatureBeats = this._timeSignatureBeats.asReadonly();
  readonly visualCountInBeat = this._visualCountInBeat.asReadonly();

  // -- Reactive Derived States --
  
  readonly canTap = computed(() => 
    this._isPlaying() && 
    this._exerciseStatus() === 'playing'
  );

  readonly lastTap = computed(() => {
    const taps = this._userTaps();
    return taps.length > 0 ? taps[taps.length - 1] : null;
  });

  readonly totalNotes = computed(() => {
    return this._tapRythmService.jsonXml().notes?.length ?? 0;
  });

  readonly totalTaps = computed(() => this._userTaps().length);

  readonly goodTaps = computed(() => 
    this._userTaps().filter(t => t.result === 'Good').length
  );

  readonly lateTaps = computed(() => 
    this._userTaps().filter(t => t.result === 'Late').length
  );

  readonly earlyTaps = computed(() => 
    this._userTaps().filter(t => t.result === 'Early').length
  );

  readonly tooLateTaps = computed(() => 
    this._userTaps().filter(t => t.result === 'Too late').length
  );

  readonly tooEarlyTaps = computed(() => 
    this._userTaps().filter(t => t.result === 'Too early').length
  );

  readonly missedTaps = computed(() => this._tapEvaluationService.missedTaps());

  // -- Public Actions --

  setNbMeasures(val: number): void { this._nbMeasures.set(val); }
  setExerciseStatus(status: ExerciseStatus): void { this._exerciseStatus.set(status); }
  setIsListening(val: boolean): void { this._isListening.set(val); }
  setExerciseMode(val: boolean): void { this._exerciseMode.set(val); }
  setPartSound(val: boolean): void { this._partSound.set(val); }
  setLevel(val: Level): void { this._level.set(val); }
  setIsPlaying(val: boolean): void { this._isPlaying.set(val); }
  setXmlIsLoaded(val: boolean): void { this._xmlIsLoaded.set(val); }
  setTapVolume(val: number): void { this._tapVolume.set(val); }
  setMasterVolume(val: number): void { this._masterVolume.set(val); }
  setMetronomeVolume(val: number): void { this._metronomeVolume.set(val); }
  setOriginalBpm(val: number): void { this._originalBpm.set(val); }
  setCountInMs(val: number): void { this._countInMs.set(val); }
  setTimeSignatureBeats(val: number): void { this._timeSignatureBeats.set(val); }
  setVisualCountInBeat(val: number): void { this._visualCountInBeat.set(val); }

  recordTap(tapMs: number, notes: number[]): void {
    const currentBpm = this._originalBpm() * this._level();
    const evaluatedTap = this._tapEvaluationService.evaluateTap(tapMs, notes, currentBpm);
    this._userTaps.update(taps => [...taps, evaluatedTap]);
  }

  resetTaps(): void {
    this._userTaps.set([]);
  }

  reset(): void {
    this._exerciseStatus.set('not-started');
    this._userTaps.set([]);
    this._resultPercentage.set(0);
    this._isPlaying.set(false);
  }

  calculateResult(): void {
    const perfect = this.goodTaps();
    const good = this.lateTaps() + this.earlyTaps();
    const bad = this.tooLateTaps() + this.tooEarlyTaps();
    const missed = this.missedTaps();

    const total = perfect + good + bad + missed;
    if (total === 0) {
      this._resultPercentage.set(0);
      return;
    }

    const score = Math.round(((perfect + good * 0.7) / total) * 100);
    this._resultPercentage.set(score);
  }

  exportEvaluationLog(notes: number[]): void {
    const taps = this._userTaps();
    let logContent = `--- TAP RYTHM EVALUATION LOG ---\n`;
    logContent += `BPM: ${this.originalBpm()} | Level: ${this.level()}\n`;
    logContent += `Note Attendue (ms) | Tap Utilisateur (ms) | Différence (ms) | Jugement\n`;
    logContent += `-----------------------------------------------------------------------\n`;

    const maxNotes = Math.max(notes.length, taps.length);
    for (let i = 0; i < maxNotes; i++) {
      const expected = notes[i] !== undefined ? Math.round(notes[i]) : 'N/A';
      if (i < taps.length) {
        const tap = taps[i];
        const tapTime = Math.round(tap.timeMs);
        const diffMs = tapTime - (tap.expectedMs || 0);
        const sign = diffMs > 0 ? '+' : '';
        logContent += `${expected.toString().padEnd(18)} | ${tapTime.toString().padEnd(20)} | ${(sign + diffMs).padEnd(15)} | ${tap.result}\n`;
      } else {
        logContent += `${expected.toString().padEnd(18)} | (Manqué)             | N/A             | Erreur / Oubli\n`;
      }
    }

    console.log(logContent);

    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tap_rythm_log_${new Date().getTime()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  resetSettings(): void {
    this._level.set(1);
    this._partSound.set(false);
    this._masterVolume.set(100);
    this._tapVolume.set(100);
    this._metronomeVolume.set(100);
  }

  saveSettings(): void {
    const settings = {
      level: this._level(),
      partSound: this._partSound(),
      masterVolume: this._masterVolume(),
      tapVolume: this._tapVolume(),
      metronomeVolume: this._metronomeVolume(),
    };
    this._localStorageService.saveSettings(settings);
  }
}
