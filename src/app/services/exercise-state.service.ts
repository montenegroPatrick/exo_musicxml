import { computed, inject, Injectable, signal } from '@angular/core';
import { ExerciseStatus, IUserTap, Level } from '../flat/models/tap.model';
import { TapEvaluationService } from './tap-evaluation.service';
import { LocalStorageService } from './local-storage.service';
import { TapRythmService } from '@app/flat/service/tap-rythm.service';

@Injectable({
  providedIn: 'root',
})
export class ExerciseStateService {
  private tapEvaluationService = inject(TapEvaluationService);
  private localStorageService = inject(LocalStorageService);
  private tapRythmService = inject(TapRythmService);
  private savedSettings = this.localStorageService.loadSettings();

  exerciseStatus = signal<ExerciseStatus>('not-started');
  userTaps = signal<IUserTap[]>([]);
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
    () => this.isPlaying() && this.exerciseStatus() === 'playing'
  );
  readonly lastTap = computed(() => {
    const taps = this.userTaps();
    return taps.length > 0 ? taps[taps.length - 1] : null;
  });

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

  recordTap(tapMs: number, notes: number[]): void {
    const evaluatedTap = this.tapEvaluationService.evaluateTap(tapMs, notes);
    this.userTaps.update((taps) => [...taps, evaluatedTap]);
    console.log('User taps', this.userTaps());
  }

  resetTaps(): void {
    this.userTaps.set([]);
  }

  reset(): void {
    this.exerciseStatus.set('not-started');
    this.userTaps.set([]);
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
    console.log('averageResult', averageResult);
    this.resultPercentage.set(Math.round(averageResult));
    if (totalTaps === 0 || goodTaps === 0) {
      this.resultPercentage.set(0);
      return;
    }

    this.resultPercentage.set(Math.round(averageResult));
    console.log('Result percentage', this.resultPercentage());
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
