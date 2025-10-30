import { computed, inject, Injectable, signal } from '@angular/core';
import { ExerciseStatus, IUserTap, Level } from '../models/tap.model';
import { TapEvaluationService } from './tap-evaluation.service';
import { LocalStorageService } from '../../../core/services/utils/local-storage.service';
import { TapRythmService } from '@app/flat/services/tap-rythm.service';
import { MetronomeService } from '../../../core/services/utils/metronome.service';
import { PerformanceEvaluationService } from './performance-evaluation.service';
import { EvaluatedTap, PerformanceMetrics } from '../models/performance.model';
import { DEFAULT_DIFFICULTY } from '../models/difficulty.config';

@Injectable({
  providedIn: 'root',
})
export class ExerciseStateService {
  private tapEvaluationService = inject(TapEvaluationService);
  private performanceEvaluationService = inject(PerformanceEvaluationService);
  private localStorageService = inject(LocalStorageService);
  private tapRythmService = inject(TapRythmService);
  private savedSettings = this.localStorageService.loadSettings();
  private metronomeService = inject(MetronomeService);
  nbMeasures = signal<number>(0);
  exerciseStatus = signal<ExerciseStatus>('not-started');
  userTaps = signal<IUserTap[]>([]);
  evaluatedTaps = signal<EvaluatedTap[]>([]);
  performanceMetrics = signal<PerformanceMetrics | null>(null);
  resultPercentage = signal<number>(0);
  isPlaying = signal<boolean>(false);
  xmlIsLoaded = signal<boolean>(false);
  isListening = signal<boolean>(false);
  partSound = signal<boolean>(this.savedSettings.partSound);
  tapVolume = signal<number>(this.savedSettings.tapVolume);
  masterVolume = signal<number>(this.savedSettings.masterVolume);
  metronomeVolume = signal<number>(this.savedSettings.metronomeVolume);
  level = signal<Level>(this.savedSettings.level);
  readonly canTap = computed(
    () =>
      this.isPlaying() &&
      this.exerciseStatus() === 'playing' &&
      this.metronomeService.countInStatus() === 'finish'
  );
  readonly lastTap = computed(() => {
    const taps = this.userTaps();
    return taps.length > 0 ? taps[taps.length - 1] : null;
  });

  readonly totalNotes = computed(() => {
    const notes = this.tapRythmService.jsonXml().notes ?? [];
    return notes.length;
  });

  readonly totalTaps = computed(() => this.userTaps().length);

  readonly goodTaps = computed(
    () => this.userTaps().filter((tap) => tap.result === 'Good').length
  );

  readonly lateTaps = computed(
    () => this.userTaps().filter((tap) => tap.result === 'Late').length
  );

  readonly earlyTaps = computed(
    () => this.userTaps().filter((tap) => tap.result === 'Early').length
  );

  readonly tooLateTaps = computed(
    () => this.userTaps().filter((tap) => tap.result === 'Too late').length
  );

  readonly tooEarlyTaps = computed(
    () => this.userTaps().filter((tap) => tap.result === 'Too early').length
  );
  readonly missedTaps = computed(() => this.tapEvaluationService.missedTaps());

  readonly perfectTaps = computed(
    () => this.evaluatedTaps().filter((tap) => tap.judgment === 'perfect').length
  );

  readonly greatTaps = computed(
    () => this.evaluatedTaps().filter((tap) => tap.judgment === 'great').length
  );

  readonly goodTapsNew = computed(
    () => this.evaluatedTaps().filter((tap) => tap.judgment === 'good').length
  );

  readonly okTaps = computed(
    () => this.evaluatedTaps().filter((tap) => tap.judgment === 'ok').length
  );

  readonly missedTapsNew = computed(
    () => this.evaluatedTaps().filter((tap) => tap.judgment === 'miss').length
  );

  readonly extraTaps = computed(
    () => this.evaluatedTaps().filter((tap) => tap.judgment === 'extra').length
  );

  setNbMeasures(nbMeasures: number): void {
    this.nbMeasures.set(nbMeasures);
  }
  setExerciseStatus(status: ExerciseStatus): void {
    this.exerciseStatus.set(status);
  }
  setIsListening(isListening: boolean): void {
    this.isListening.set(isListening);
  }
  setPartSound(partSound: boolean): void {
    this.partSound.set(partSound);
  }
  setLevel(level: Level): void {
    this.level.set(level);
  }
  setIsPlaying(isPlaying: boolean): void {
    this.isPlaying.set(isPlaying);
  }

  setXmlIsLoaded(isLoaded: boolean): void {
    this.xmlIsLoaded.set(isLoaded);
  }

  initializeExercise(notes: number[]): void {
    this.performanceEvaluationService.initializeNotes(notes);
    this.evaluatedTaps.set([]);
    this.performanceMetrics.set(null);
  }

  recordTap(tapMs: number, notes: number[]): void {
    const legacyEvaluatedTap = this.tapEvaluationService.evaluateTap(tapMs, notes);
    this.userTaps.update((taps) => [...taps, legacyEvaluatedTap]);

    const evaluatedTap = this.performanceEvaluationService.evaluateTap(
      tapMs,
      DEFAULT_DIFFICULTY.windows
    );
    this.evaluatedTaps.update((taps) => [...taps, evaluatedTap]);

    this.updateMetrics();
  }

  evaluateMissedNotes(currentTime: number): void {
    const missedTaps = this.performanceEvaluationService.evaluateMissedNotes(
      currentTime,
      DEFAULT_DIFFICULTY.windows
    );
    this.evaluatedTaps.update((taps) => [...taps, ...missedTaps]);
    this.updateMetrics();
  }

  private updateMetrics(): void {
    const metrics = this.performanceEvaluationService.calculateMetrics(
      this.evaluatedTaps()
    );
    this.performanceMetrics.set(metrics);
    this.resultPercentage.set(Math.round(metrics.accuracy));
  }

  resetTaps(): void {
    this.userTaps.set([]);
  }

  reset(): void {
    this.exerciseStatus.set('not-started');
    this.userTaps.set([]);
    this.evaluatedTaps.set([]);
    this.performanceMetrics.set(null);
    this.performanceEvaluationService.reset();
    this.resultPercentage.set(0);
    this.isPlaying.set(false);
  }
  setTapVolume(volume: number): void {
    this.tapVolume.set(volume);
  }
  setMasterVolume(volume: number): void {
    this.masterVolume.set(volume);
  }
  setMetronomeVolume(volume: number): void {
    this.metronomeVolume.set(volume);
  }
  calculateResult(): void {
    const taps = this.userTaps();
    const goodTaps = taps.filter((tap) => tap.result === 'Good').length;
    const lateTaps = taps.filter((tap) => tap.result === 'Late').length;
    const earlyTaps = taps.filter((tap) => tap.result === 'Early').length;
    const tooLateTaps = taps.filter((tap) => tap.result === 'Too late').length;
    const tooEarlyTaps = taps.filter(
      (tap) => tap.result === 'Too early'
    ).length;

    const totalTaps = taps.length;
    const notes = this.tapRythmService.jsonXml().notes ?? [];
    const totalNotes = notes.length;
    const percentageGood = (goodTaps / totalNotes) * 100;
    const percentageLate = (lateTaps / totalNotes) * 100;
    const percentageEarly = (earlyTaps / totalNotes) * 100;
    const percentageTooLate = (tooLateTaps / totalNotes) * 100;
    const percentageTooEarly = (tooEarlyTaps / totalNotes) * 100;
    let averageResult =
      percentageGood -
      percentageLate -
      percentageEarly -
      percentageTooLate -
      percentageTooEarly;
    if (averageResult < 0) {
      averageResult = 0;
    }

    this.resultPercentage.set(Math.round(averageResult));
    if (totalTaps === 0 || goodTaps === 0) {
      this.resultPercentage.set(0);
      return;
    }

    this.resultPercentage.set(Math.round(averageResult));
  }
  resetSettings(): void {
    this.level.set(1);
    this.partSound.set(false);
    this.masterVolume.set(100);
    this.tapVolume.set(100);
    this.metronomeVolume.set(100);
  }

  saveSettings(): void {
    const settings = {
      level: this.level(),
      partSound: this.partSound(),
      masterVolume: this.masterVolume(),
      tapVolume: this.tapVolume(),
      metronomeVolume: this.metronomeVolume(),
    };
    this.localStorageService.saveSettings(settings);
  }
}
