import { Injectable, inject, effect, Signal, signal } from '@angular/core';
import { JwpService } from '@core/services/jwp.service';
import { LessonService } from './lesson.service';
import { DiapoStateService } from '@core/shared/diapo/services/diapo.service';
import { IVideoSync } from '@core/interfaces/lesson.interface';

@Injectable({
  providedIn: 'root'
})
export class VideoSyncService {
  private _jwpService = inject(JwpService);
  private _lessonService = inject(LessonService);
  private _diapoService = inject(DiapoStateService);

  private _isBusting = false; // Flag to prevent infinite loops if we ever do two-way sync

  constructor() {
    // We use an effect to react to video time changes
    effect(() => {
      const currentTimeSeconds = this._jwpService.positionMs() / 1000;
      const syncPoints = this._lessonService.videoSyncPoints();
      
      if (syncPoints.length === 0) {
        return;
      }
      if (syncPoints.length === 0) return;

      // Find the last sync point that is less than or equal to current time
      // syncPoints should be sorted by timeCode
      let activeSyncPoint: IVideoSync | null = null;
      
      for (const point of syncPoints) {
        if (point.timeCode <= currentTimeSeconds + 0.1) { // 0.1s buffer for better reactivity
          activeSyncPoint = point;
        } else {
          break; // Since it's sorted, we can stop
        }
      }

      if (activeSyncPoint !== null) {
        // The pos in videoSync is 0-indexed (array index), 
        // but DiapoStateService expects 1-indexed for the UI.
        const targetPos = activeSyncPoint.pos + 1;
        
        if (this._diapoService.currentImageListPos() !== targetPos) {
          console.log(`[VideoSync]: Syncing to pos ${targetPos} at ${currentTimeSeconds}s`);
          this._diapoService.currentImageListPos.set(targetPos);
        }
      }
    });
  }

  /**
   * Manual trigger if needed, though the constructor effect handles it reactively.
   */
  syncNow() {
    // The effect will trigger automatically as soon as this service is instantiated
    // and JwpService.positionMs changes.
  }
}
