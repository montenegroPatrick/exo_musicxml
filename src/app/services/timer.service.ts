import { inject, Injectable, signal } from '@angular/core';
import { MetronomeService } from './metronome.service';
import { TapEvaluationService } from './tap-evaluation.service';
import { ExerciseStateService } from './exercise-state.service';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private evaluationService = inject(TapEvaluationService);
  private exerciseState = inject(ExerciseStateService);
  private _currentTimeMs = signal<number>(0);
  private timerStartTime: number = 0;
  private timerIntervalId: any = null;

  readonly currentTimeMs = this._currentTimeMs.asReadonly();

  start(): void {
    if (this.timerIntervalId) {
      return;
    }

    this.timerStartTime = Date.now() - this._currentTimeMs();
    this.timerIntervalId = setInterval(() => {
      this._currentTimeMs.set(Date.now() - this.timerStartTime);
    }, 10); // 10ms precision
  }

  stop(): void {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  reset(): void {
    this.stop();
    this._currentTimeMs.set(0);
    this.timerStartTime = 0;
  }
}
