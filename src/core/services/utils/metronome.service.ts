import { Injectable, signal } from '@angular/core';
import { CountInStatus } from '../../../app/flat/models/tap.model';

@Injectable({
  providedIn: 'root',
})
export class MetronomeService {
  private _countInStatus = signal<CountInStatus>('not-started');
  private _metronomeTick = signal<number>(1);
  private _originalBpm = signal<number>(0);
  private _bpm = signal<number>(0);
  private _timeSignature = signal<number>(4);
  private _timeBeatType = signal<number>(4);
  private _ratioBeatType = signal<number>(1);
  private timerIntervalId: any = null;

  private _timeBetweenTicks = signal<number>(0);
  readonly ratioBeatType = this._ratioBeatType.asReadonly();
  readonly countInStatus = this._countInStatus.asReadonly();
  readonly metronomeTick = this._metronomeTick.asReadonly();
  readonly bpm = this._bpm.asReadonly();
  readonly timeSignature = this._timeSignature.asReadonly();
  readonly originalBpm = this._originalBpm.asReadonly();
  readonly timeBetweenTicks = this._timeBetweenTicks.asReadonly();
  readonly timeBeatType = this._timeBeatType.asReadonly();

  setBpm(bpm: number): void {
    this._bpm.set(bpm);
  }
  setOriginalBpm(bpm: number): void {
    this._originalBpm.set(bpm);
  }
  setTimeSignature(timeSignature: number): void {
    this._timeSignature.set(timeSignature);
  }
  setTimeBeatType(timeBeatType: number): void {
    this._timeBeatType.set(timeBeatType);
  }
  startCountIn(onComplete: () => void): void {
    this._countInStatus.set('play');
    this._metronomeTick.set(1);

    switch (this._timeBeatType()) {
      case 2:
        this._ratioBeatType.set(2);
        break;
      case 4:
        this._ratioBeatType.set(1);
        break;
      case 8:
        this._ratioBeatType.set(0.5);
        break;

      default:
        this._ratioBeatType.set(1);
        break;
    }
    this._timeBetweenTicks.set((60000 / this._bpm()) * this.ratioBeatType());

    this.timerIntervalId = setInterval(() => {
      if (this._metronomeTick() === this._timeSignature()) {
        onComplete();
        this._metronomeTick.set(1);
        this._countInStatus.set('finish');
        this.stop();
      } else {
        this._metronomeTick.update((tick) => tick + 1);
      }
    }, this._timeBetweenTicks());
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
