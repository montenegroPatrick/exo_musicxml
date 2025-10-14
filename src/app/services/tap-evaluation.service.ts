import { Injectable } from '@angular/core';
import { IUserTap } from '../flat/models/tap.model';

@Injectable({
  providedIn: 'root',
})
export class TapEvaluationService {
  private readonly TOLERANCE_MS = 100;

  evaluateTap(tapMs: number, notes: number[]): IUserTap {
    if (!notes || notes.length === 0) {
      return { timeMs: tapMs, result: 'Too late', diffMs: 0 };
    }

    // Find closest note
    const diffs = notes.map((noteMs, index) => ({
      noteMs: Number(noteMs.toFixed(2)),
      diffMs: Math.abs(tapMs - noteMs),
      index,
    }));

    const closestNote = diffs.sort((a, b) => a.diffMs - b.diffMs)[0];

    // Evaluate tap result
    if (
      tapMs === closestNote.noteMs ||
      (tapMs > closestNote.noteMs && closestNote.diffMs < this.TOLERANCE_MS) ||
      (tapMs < closestNote.noteMs && closestNote.diffMs < this.TOLERANCE_MS)
    ) {
      return {
        timeMs: tapMs,
        result: 'Good',
        diffMs: closestNote.diffMs,
      };
    } else if (tapMs > closestNote.noteMs && closestNote.diffMs < 200) {
      return {
        timeMs: tapMs,
        result: 'Late',
        diffMs: closestNote.diffMs,
      };
    } else if (tapMs < closestNote.noteMs && closestNote.diffMs < 200) {
      return {
        timeMs: tapMs,
        result: 'Early',
        diffMs: closestNote.diffMs,
      };
    } else if (tapMs > closestNote.noteMs && closestNote.diffMs > 200) {
      return {
        timeMs: tapMs,
        result: 'Too late',
        diffMs: closestNote.diffMs,
      };
    } else {
      return {
        timeMs: tapMs,
        result: 'Too early',
        diffMs: closestNote.diffMs,
      };
    }
  }
}
