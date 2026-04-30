import { Injectable, inject, effect, untracked } from '@angular/core';
import { JwpService } from '@core/services/jwp.service';
import { LessonService } from './lesson.service';
import { DiapoStateService } from '@core/shared/diapo/services/diapo.service';
import { IVideoSync } from '@core/interfaces/lesson.interface';
import { FlatService } from '@core/services/flat.service';
import { CoreDataService } from '@core/services/core-data.service';

@Injectable({
  providedIn: 'root'
})
export class VideoSyncService {
  private readonly _jwpService = inject(JwpService);
  private readonly _lessonService = inject(LessonService);
  private readonly _diapoService = inject(DiapoStateService);
  private readonly _flatService = inject(FlatService);
  private readonly _coreData = inject(CoreDataService);

  constructor() {
    this._initAutoSync();
    this._initScoreSync();
    this._initScoreToVideoInteractivity();
  }

  /**
   * Listens to requests coming FROM the score (Flat.io UI) 
   * to control the Video (JW Player).
   */
  private _initScoreToVideoInteractivity(): void {
    // 1. Seek Request (Inverse Seek)
    effect(() => {
      const request = this._coreData.seekRequest();
      if (request) {
        untracked(() => {
          const jwId = this._coreData.jwPlayerId();
          console.log('%c[VideoSyncService] INTERCEPTED SEEK REQUEST:', 'background: #2196F3; color: white; padding: 2px 5px', {
            time: request.time,
            jwId: jwId,
            jwpReady: this._jwpService.isReady()
          });

          // La vidéo ne réagit que si un ID JW est présent
          if (jwId) {
            console.log(`[VideoSyncService] Executing JW Player Seek to ${request.time}s`);
            this._jwpService.seek(request.time);
            
            // Synchronisation forcée de Flat.io car JWPlayer ne déclenche pas toujours 
            // d'événement 'time' instantanément quand il est en pause
            const isPlaying = this._jwpService.playbackState() === 'playing';
            this._flatService.syncWithAudio(request.time, isPlaying);
          } else {
            console.warn('[VideoSyncService] Seek ignored: No jwPlayerId found in CoreData, but syncing Flat.io score anyway');
            this._flatService.syncWithAudio(request.time, false);
          }
        });
      }
    });

    // 2. Loop Request
    effect(() => {
      const request = this._coreData.loopRangeRequest();
      if (request) {
        untracked(() => {
          if (this._coreData.jwPlayerId()) {
            console.log(`[VideoSyncService] Loop Range requested via CoreData: [${request.start}s - ${request.end}s] from ${request.source}`);
            this._jwpService.setLoopRange(request.start, request.end);
            
            // If the loop was adjusted from the video control bar, clear the Flat selection.
            if (request.source === 'ui') {
                this._flatService.clearSelection();
            }
          }
        });
      }
    });
  }

  /**
   * Synchronizes Flat.io score with video playback time.
   */
  private _initScoreSync(): void {
    effect(() => {
      const currentTime = this._jwpService.positionMs() / 1000;
      const isPlaying = this._jwpService.playbackState() === 'playing';
      const isReady = this._flatService.isReady();

      if (isReady && currentTime > 0) {
        untracked(() => {
            // console.log(`[VideoSyncService] Syncing Score with Video Time: ${currentTime}s (Playing: ${isPlaying})`);
            this._flatService.syncWithAudio(currentTime, isPlaying);
        });
      }
    });
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
