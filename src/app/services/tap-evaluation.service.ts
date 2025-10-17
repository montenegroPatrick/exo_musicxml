import { inject, Injectable, signal } from '@angular/core';
import { IUserTap } from '../flat/models/tap.model';
import { TapRythmService } from '@app/flat/service/tap-rythm.service';
import { ExerciseStateService } from './exercise-state.service';

@Injectable({
  providedIn: 'root',
})
export class TapEvaluationService {
  private tapRythmService = inject(TapRythmService);
  private readonly TOLERANCE_MS = 100;

  missedTaps = signal<number>(0);

  evaluateTap(tapMs: number, notes: number[]): IUserTap {
    const latenceMetronomeSound = 100;
    if (!notes || notes.length === 0) {
      return { timeMs: tapMs, result: 'Too late', diffMs: 0 };
    }
    const tapMsWithLatence = tapMs - latenceMetronomeSound;

    // Find closest note
    const diffs = notes.map((noteMs, index) => ({
      noteMs: Number(noteMs.toFixed(2)),
      diffMs: Number(Math.abs(tapMsWithLatence - noteMs).toFixed(2)),
      index,
    }));

    const closestNote = diffs.sort((a, b) => a.diffMs - b.diffMs)[0];

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
  // evaluateMissedTap(userTaps: IUserTap[]): void {
  //   const notes = this.tapRythmService.jsonXml().notes ?? [];
  //   const latenceMetronomeSound = 100;
  //   let missedCount = 0;

  //   // Pour chaque note attendue, vérifier s'il y a un tap utilisateur correspondant
  //   for (let index = 0; index < notes.length; index++) {
  //     const noteMs = notes[index];
  //     const noteTimeWithLatence = noteMs + latenceMetronomeSound;
  //     let hasCorrespondingTap = false;

  //     // Vérifier si un tap utilisateur correspond à cette note (dans la fenêtre de tolérance)

  //       for (const userTap of userTaps) {
  //         const diffs = userTaps.map((tap) => ({
  //           noteMs: Number(tap.timeMs.toFixed(2)),
  //           diffMs: Number(Math.abs(userTap.timeMs - noteTimeWithLatence).toFixed(2)),
  //         }));
  //         const closestNote = diffs.sort((a, b) => a.diffMs - b.diffMs)[0];
  //         if (Math.abs(closestNote.diffMs) > ) {
  //           hasCorrespondingTap = true;
  //           break;
  //         }

  //       // Si aucune note attendue n'a de tap correspondant, c'est un tap manqué
  //       if (!hasCorrespondingTap) {
  //         missedCount++;
  //       }
  //     }
  //   }

  //   this.missedTaps.set(missedCount);
  // }
  evaluateMissedTap(userTaps: IUserTap[]): void {
    const notes = this.tapRythmService.jsonXml().notes ?? [];

    for (let i = 0; i < notes.length; i++) {
      const noteMs = notes[i];
      const nextNoteMs = notes[i + 1];
      if (nextNoteMs == undefined) {
      }
      if (userTaps.length === 0) {
        this.missedTaps.set(notes.length);
        return;
      }
      const closesTap = userTaps.find(
        (tap) => tap.timeMs > noteMs && tap.timeMs < nextNoteMs
      );
      if (closesTap == undefined) {
        this.missedTaps.set(this.missedTaps() + 1);
      }
    }
  }
}
