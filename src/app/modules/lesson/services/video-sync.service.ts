import { Injectable, inject, effect, untracked } from '@angular/core';
import { JwpService } from '@core/services/jwp.service';
import { LessonService } from './lesson.service';
import { DiapoStateService } from '@core/shared/diapo/services/diapo.service';
import { IVideoSync } from '@core/interfaces/lesson.interface';

@Injectable({
  providedIn: 'root'
})
export class VideoSyncService {
  private readonly _jwpService = inject(JwpService);
  private readonly _lessonService = inject(LessonService);
  private readonly _diapoService = inject(DiapoStateService);

  constructor() {
    this._initAutoSync();
  }

  /**
   * Initializes the reactive effect that tracks video playback 
   * and synchronizes the slideshow (diapo) position.
   */
  private _initAutoSync(): void {
    effect(() => {
      const currentTime = this._jwpService.positionMs() / 1000;
      const syncPoints = this._lessonService.videoSyncPoints();
      
      if (syncPoints.length === 0) return;

      const activePoint = this._findActiveSyncPoint(currentTime, syncPoints);
      
      if (activePoint) {
        // Target position is 1-indexed in UI but 0-indexed in data
        const targetPos = activePoint.pos + 1;
        
        // Only update if different, using untracked to avoid cyclic dependency
        const currentPos = untracked(() => this._diapoService.currentImageListPos());
        
        if (currentPos !== targetPos) {
          this._diapoService.setPos(targetPos);
        }
      }
    });
  }

  /**
   * Finds the last sync point that has passed relative to current time.
   * Assumes syncPoints are sorted by timeCode.
   */
  private _findActiveSyncPoint(time: number, points: IVideoSync[]): IVideoSync | null {
    let active: IVideoSync | null = null;
    
    // 0.1s buffer to ensure we don't miss transitions due to tiny timing differences
    const threshold = time + 0.1;

    for (const point of points) {
      if (point.timeCode <= threshold) {
        active = point;
      } else {
        // Since points are sorted, we can exit early once we exceed the threshold
        break;
      }
    }
    
    return active;
  }
}
