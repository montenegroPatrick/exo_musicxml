import { Injectable } from '@angular/core';
import { IUserTap } from '../flat/models/tap.model';

@Injectable({
  providedIn: 'root',
})
export class TapEvaluationService {
  private readonly TOLERANCE_MS = 150;

  evaluateTap(tapMs: number, notes: number[]): IUserTap {
    const latenceMetronomeSound = 100;
    if (!notes || notes.length === 0) {
      return { timeMs: tapMs, result: 'Too late', diffMs: 0 };
    }
    const tapMsWithLatence = tapMs - latenceMetronomeSound;
    console.log('tapMsWithLatence', tapMsWithLatence);

    // Find closest note
    const diffs = notes.map((noteMs, index) => ({
      noteMs: Number(noteMs.toFixed(2)),
      diffMs: Number(Math.abs(tapMsWithLatence - noteMs).toFixed(2)),
      index,
    }));

    const closestNote = diffs.sort((a, b) => a.diffMs - b.diffMs)[0];
    console.log(closestNote);
    // Evaluate tap result
    if (
      tapMsWithLatence === closestNote.noteMs ||
      (tapMsWithLatence > closestNote.noteMs &&
        closestNote.diffMs < this.TOLERANCE_MS) ||
      (tapMsWithLatence < closestNote.noteMs &&
        closestNote.diffMs < this.TOLERANCE_MS)
    ) {
      return {
        timeMs: tapMs,
        result: 'Good',
        diffMs: closestNote.diffMs,
      };
    } else if (
      tapMsWithLatence > closestNote.noteMs &&
      closestNote.diffMs < 200
    ) {
      return {
        timeMs: tapMs,
        result: 'Late',
        diffMs: closestNote.diffMs,
      };
    } else if (
      tapMsWithLatence < closestNote.noteMs &&
      closestNote.diffMs < 200
    ) {
      return {
        timeMs: tapMs,
        result: 'Early',
        diffMs: closestNote.diffMs,
      };
    } else if (
      tapMsWithLatence > closestNote.noteMs &&
      closestNote.diffMs > 200
    ) {
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
