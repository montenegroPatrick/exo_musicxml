import { inject, Injectable, signal } from '@angular/core';
import { IUserTap } from '../interface/flat.interface';
import { TapRythmService } from '@app/modules/tap-rythm/services/tap-rythm.service';

@Injectable({
  providedIn: 'root',
})
export class TapEvaluationService {
  private tapRythmService = inject(TapRythmService);

  missedTaps = signal<number>(0);

  evaluateTap(tapMs: number, notes: number[], currentBpm: number): IUserTap {
    if (!notes || notes.length === 0) {
      return { timeMs: tapMs, expectedMs: 0, result: 'Too late', diffMs: 0 };
    }

    // Find closest note
    const diffs = notes.map((noteMs, index) => ({
      noteMs: Number(noteMs.toFixed(2)),
      diffMs: Number(Math.abs(tapMs - noteMs).toFixed(2)),
      index,
    }));
    const closestNote = diffs.sort((a, b) => a.diffMs - b.diffMs)[0];

    // --- Adaptive Precision Strategy ---
    const bpm = currentBpm || 60;
    const msPerBeat = 60000 / bpm;
    
    const errorMargeCode = this.tapRythmService.jsonXml()?.noteErrorMarge || 'dc';
    const durationMap: Record<string, number> = { 'w': 4, 'h': 2, 'q': 1, '8': 0.5, '16': 0.25, 'dc': 0.25, 'c': 0.5, 'n': 1 };
    const referenceDurationMs = (durationMap[errorMargeCode] || 0.25) * msPerBeat;

    // Use default Medium difficulty factors: Perfect < 35%, Good < 65%
    const perfectMargin = referenceDurationMs * 0.35;
    const goodMargin = referenceDurationMs * 0.65;
    
    let result: 'Good' | 'Late' | 'Early' | 'Too late' | 'Too early' = 'Too late';

    if (closestNote.diffMs < perfectMargin) {
      result = 'Good'; // Perfect maps to Good in this interface
    } else if (closestNote.diffMs < goodMargin) {
      result = tapMs > closestNote.noteMs ? 'Late' : 'Early';
    } else {
      result = tapMs > closestNote.noteMs ? 'Too late' : 'Too early';
    }

    return {
      timeMs: tapMs,
      expectedMs: closestNote.noteMs,
      diffMs: closestNote.diffMs,
      result
    };
  }

  evaluateMissedTap(userTaps: IUserTap[]): void {
    const notes = this.tapRythmService.jsonXml()?.notes ?? [];
    
    // We consider a note "tapped" if there's any userTap that hit it with a reasonable diffMs
    // A tap is valid if it's not 'Too early' and not 'Too late'
    const validTaps = userTaps.filter(t => t.result !== 'Too early' && t.result !== 'Too late');
    
    // To match Patrick's logic: count expected notes that are NOT hit
    // Since our userTaps don't explicitly store expectedTimeMs, we can just say:
    // Any valid tap "consumes" the closest note.
    
    let missedCount = notes.length;
    
    // A simpler logic: just count how many notes didn't get any tap within a wide margin
    for (let i = 0; i < notes.length; i++) {
      const noteMs = notes[i];
      // Check if any valid tap is close enough to this note (e.g. within 200ms or reference margin)
      const isHit = validTaps.some(tap => Math.abs(tap.timeMs - noteMs) < 300);
      if (isHit) {
        missedCount--;
      }
    }

    this.missedTaps.set(Math.max(0, missedCount));
  }
}
