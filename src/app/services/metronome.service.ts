import { Injectable, signal } from '@angular/core';
import { CountInStatus } from '../flat/models/tap.model';

@Injectable({
  providedIn: 'root',
})
export class MetronomeService {
  private _countInStatus = signal<CountInStatus>('not-started');
  private _metronomeTick = signal<number>(1);
  private _originalBpm = signal<number>(0);
  private _bpm = signal<number>(0);
  private _timeSignature = signal<number>(4);
  private timerIntervalId: any = null;

  readonly countInStatus = this._countInStatus.asReadonly();
  readonly metronomeTick = this._metronomeTick.asReadonly();
  readonly bpm = this._bpm.asReadonly();
  readonly timeSignature = this._timeSignature.asReadonly();
  readonly originalBpm = this._originalBpm.asReadonly();
  setBpm(bpm: number): void {
    this._bpm.set(bpm);
  }
  setOriginalBpm(bpm: number): void {
    this._originalBpm.set(bpm);
  }
  setTimeSignature(timeSignature: number): void {
    this._timeSignature.set(timeSignature);
  }

  startCountIn(onComplete: () => void): void {
    this._countInStatus.set('play');
    this._metronomeTick.set(1);

    const timeBetweenTicks = 60000 / this._bpm();
    console.log('Time between ticks', timeBetweenTicks);

    this.timerIntervalId = setInterval(() => {
      if (this._metronomeTick() === this._timeSignature()) {
        this._metronomeTick.set(1);
        this._countInStatus.set('finish');
        this.stop();
        onComplete();
      } else {
        this._metronomeTick.update((tick) => tick + 1);
      }
    }, timeBetweenTicks);
  }

  stop(): void {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  reset(): void {
    this.stop();
    this._countInStatus.set('not-started');
    this._metronomeTick.set(1);
  }
}
