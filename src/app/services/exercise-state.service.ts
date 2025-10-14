import { computed, inject, Injectable, signal } from '@angular/core';
import { ExerciseStatus, IUserTap } from '../flat/models/tap.model';
import { TapEvaluationService } from './tap-evaluation.service';

@Injectable({
  providedIn: 'root',
})
export class ExerciseStateService {
  private tapEvaluationService = inject(TapEvaluationService);

  private _exerciseStatus = signal<ExerciseStatus>('not-started');
  private _userTaps = signal<IUserTap[]>([]);
  private _resultPercentage = signal<number>(0);
  private _isPlaying = signal<boolean>(false);
  private _xmlIsLoaded = signal<boolean>(false);

  readonly exerciseStatus = this._exerciseStatus.asReadonly();
  readonly userTaps = this._userTaps.asReadonly();
  readonly resultPercentage = this._resultPercentage.asReadonly();
  readonly isPlaying = this._isPlaying.asReadonly();
  readonly xmlIsLoaded = this._xmlIsLoaded.asReadonly();

  readonly isFinished = computed(() => this._exerciseStatus() === 'finish');
  readonly canTap = computed(
    () => this._isPlaying() && this._exerciseStatus() === 'playing'
  );

  readonly lastTap = computed(() => {
    const taps = this._userTaps();
    return taps.length > 0 ? taps[taps.length - 1] : null;
  });

  setExerciseStatus(status: ExerciseStatus): void {
    this._exerciseStatus.set(status);
  }

  setIsPlaying(isPlaying: boolean): void {
    this._isPlaying.set(isPlaying);
  }

  setXmlIsLoaded(isLoaded: boolean): void {
    this._xmlIsLoaded.set(isLoaded);
  }

  recordTap(tapMs: number, notes: number[]): void {
    const evaluatedTap = this.tapEvaluationService.evaluateTap(tapMs, notes);
    this._userTaps.update((taps) => [...taps, evaluatedTap]);
    console.log('User taps', this._userTaps());
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
    const taps = this._userTaps();
    const goodTaps = taps.filter((tap) => tap.result === 'Good').length;
    const totalTaps = taps.length;

    if (totalTaps === 0 || goodTaps === 0) {
      this._resultPercentage.set(0);
      return;
    }

    const percentageGood = (goodTaps / totalTaps) * 100;
    this._resultPercentage.set(Math.round(percentageGood));
    console.log('Result percentage', this._resultPercentage());
  }
}
