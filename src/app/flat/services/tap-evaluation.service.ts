import { inject, Injectable, signal } from '@angular/core';
import { IUserTap } from '../models/tap.model';
import { TapRythmService } from '@app/flat/services/tap-rythm.service';
import { ExerciseStateService } from './exercise-state.service';

@Injectable({
  providedIn: 'root',
})
export class TapEvaluationService {
  private tapRythmService = inject(TapRythmService);
  private readonly TOLERANCE_MS = 100;

  missedTaps = signal<number>(0);

  evaluateTap(tapMs: number, notes: number[]): IUserTap {
    // notes = tableaux de notes en ms
    // tapMs = moment du tap utilisateur en ms
    // ce que nous voulons c'est évaluer le tap par rapport aux notes, en sachant que l'utilisateur doit être dans une fenetre de latence de 100ms autour de la note de référence qui est la note la plus proche du tap
    // si le tap est dans la fenetre de latence, on retourne Good
    // si le tap est en dehors de la fenetre de latence, on retourne Too late ou Too early
    // si le tap est dedans en dehors de la fenetre de latence, mais avec une marge de 100ms, on retourne Late ou Early
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
    console.log(closestNote);

    //conditions
    const isGood =
      tapMsWithLatence === closestNote.noteMs ||
      (tapMsWithLatence > closestNote.noteMs &&
        closestNote.diffMs < this.TOLERANCE_MS) ||
      (tapMsWithLatence < closestNote.noteMs &&
        closestNote.diffMs < this.TOLERANCE_MS);
    const isLate =
      tapMsWithLatence > closestNote.noteMs && closestNote.diffMs < 200;
    const isEarly =
      tapMsWithLatence < closestNote.noteMs && closestNote.diffMs < 200;
    const isTooLate =
      tapMsWithLatence > closestNote.noteMs && closestNote.diffMs > 200;
    const isTooEarly =
      tapMsWithLatence < closestNote.noteMs && closestNote.diffMs > 200;
    // Evaluate tap result
    let resultFinal: IUserTap = {
      timeMs: tapMs,
      diffMs: closestNote.diffMs,
      result: 'Good',
    };
    if (isGood) {
      resultFinal.result = 'Good';
      return resultFinal;
    }
    if (isLate) {
      resultFinal.result = 'Late';
      return resultFinal;
    }
    if (isEarly) {
      resultFinal.result = 'Early';
      return resultFinal;
    }
    if (isTooLate) {
      resultFinal.result = 'Too late';
      return resultFinal;
    }
    if (isTooEarly) {
      resultFinal.result = 'Too early';
      return resultFinal;
    }
    return resultFinal;
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
  }
  evaluateMissedTap(userTaps: IUserTap[]): void {
    const notes = this.tapRythmService.jsonXml().notes ?? [];

    for (let i = 0; i < notes.length; i++) {
      const noteMs = notes[i];
      const nextNoteMs = notes[i + 1];
      if (nextNoteMs == undefined) {
        return;
      }
      if (userTaps.length === 0) {
        this.missedTaps.set(notes.length);
        return;
      }
      const closesTap = userTaps.find(
        (tap) => noteMs < tap.timeMs && tap.timeMs < nextNoteMs
      );
      if (closesTap == undefined) {
        this.missedTaps.set(this.missedTaps() + 1);
      }
    }
  }
}
