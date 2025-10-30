import { Injectable } from '@angular/core';
import {
  EvaluatedTap,
  NoteState,
  PerformanceMetrics,
  TapJudgment,
  TimingWindows,
} from '../models/performance.model';

@Injectable({
  providedIn: 'root',
})
export class PerformanceEvaluationService {
  private readonly AUDIO_LATENCY_MS = 100;
  private readonly POINTS_MAP: Record<TapJudgment, number> = {
    perfect: 100,
    great: 80,
    good: 60,
    ok: 40,
    miss: 0,
    extra: 0,
  };

  private currentNoteIndex = 0;
  private noteStates: NoteState[] = [];

  initializeNotes(expectedTimes: number[]): void {
    this.currentNoteIndex = 0;
    this.noteStates = expectedTimes.map((time) => ({
      expectedTime: time,
      consumed: false,
    }));
  }

  evaluateTap(tapTime: number, windows: TimingWindows): EvaluatedTap {
    const adjustedTapTime = tapTime - this.AUDIO_LATENCY_MS;

    for (let i = this.currentNoteIndex; i < this.noteStates.length; i++) {
      const note = this.noteStates[i];

      if (note.consumed) continue;

      const error = adjustedTapTime - note.expectedTime;
      const absError = Math.abs(error);

      if (error < -windows.ok) {
        break;
      }

      if (error > windows.ok) {
        continue;
      }

      note.consumed = true;
      note.error = error;

      let judgment: TapJudgment;
      if (absError <= windows.perfect) {
        judgment = 'perfect';
      } else if (absError <= windows.great) {
        judgment = 'great';
      } else if (absError <= windows.good) {
        judgment = 'good';
      } else {
        judgment = 'ok';
      }

      note.judgment = judgment;

      if (i === this.currentNoteIndex) {
        this.currentNoteIndex++;
      }

      return {
        noteIndex: i,
        tapTime,
        expectedTime: note.expectedTime,
        error,
        judgment,
        points: this.POINTS_MAP[judgment],
      };
    }

    return {
      noteIndex: null,
      tapTime,
      expectedTime: null,
      error: 0,
      judgment: 'extra',
      points: 0,
    };
  }

  evaluateMissedNotes(currentTime: number, windows: TimingWindows): EvaluatedTap[] {
    const missedTaps: EvaluatedTap[] = [];
    const adjustedCurrentTime = currentTime - this.AUDIO_LATENCY_MS;

    for (let i = this.currentNoteIndex; i < this.noteStates.length; i++) {
      const note = this.noteStates[i];

      if (note.consumed) continue;

      if (adjustedCurrentTime - note.expectedTime > windows.ok) {
        note.consumed = true;
        note.judgment = 'miss';
        note.error = adjustedCurrentTime - note.expectedTime;

        missedTaps.push({
          noteIndex: i,
          tapTime: 0,
          expectedTime: note.expectedTime,
          error: note.error,
          judgment: 'miss',
          points: 0,
        });
      } else {
        break;
      }
    }

    return missedTaps;
  }

  calculateMetrics(evaluatedTaps: EvaluatedTap[]): PerformanceMetrics {
    const totalNotes = this.noteStates.length;
    const maxPoints = totalNotes * this.POINTS_MAP.perfect;

    let totalPoints = 0;
    let perfectCount = 0;
    let greatCount = 0;
    let goodCount = 0;
    let okCount = 0;
    let missCount = 0;
    let extraTapsCount = 0;

    const errors: number[] = [];

    for (const tap of evaluatedTaps) {
      totalPoints += tap.points;

      switch (tap.judgment) {
        case 'perfect':
          perfectCount++;
          break;
        case 'great':
          greatCount++;
          break;
        case 'good':
          goodCount++;
          break;
        case 'ok':
          okCount++;
          break;
        case 'miss':
          missCount++;
          break;
        case 'extra':
          extraTapsCount++;
          break;
      }

      if (tap.noteIndex !== null && tap.error !== 0) {
        errors.push(tap.error);
      }
    }

    const accuracy = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

    const averageError =
      errors.length > 0
        ? errors.reduce((sum, err) => sum + Math.abs(err), 0) / errors.length
        : 0;

    const mean = errors.length > 0 ? errors.reduce((sum, err) => sum + err, 0) / errors.length : 0;

    const variance =
      errors.length > 0
        ? errors.reduce((sum, err) => sum + Math.pow(err - mean, 2), 0) / errors.length
        : 0;

    const standardDeviation = Math.sqrt(variance);
    const unstableRate = standardDeviation * 10;
    const earlyLateBias = mean;

    return {
      accuracy: Number(accuracy.toFixed(2)),
      totalPoints,
      maxPoints,
      perfectCount,
      greatCount,
      goodCount,
      okCount,
      missCount,
      extraTapsCount,
      averageError: Number(averageError.toFixed(2)),
      standardDeviation: Number(standardDeviation.toFixed(2)),
      unstableRate: Number(unstableRate.toFixed(2)),
      earlyLateBias: Number(earlyLateBias.toFixed(2)),
    };
  }

  reset(): void {
    this.currentNoteIndex = 0;
    this.noteStates = [];
  }
}
