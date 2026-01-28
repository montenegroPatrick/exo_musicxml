import { effect, inject, Injectable, signal } from '@angular/core';
import { FlatService } from '@core/services/flat.service';
import { JwpService } from '@core/services/jwp.service';
import { LessonService } from '@app/modules/lesson/services/lesson.service';
import { ControlBarType } from '@core/interfaces/lesson.interface';

export type IControlBar = ControlBarType;

@Injectable({
  providedIn: 'root',
})
export class ControlBarService {
  private _jwpService = inject(JwpService);
  private _flatService = inject(FlatService);
  private _lessonService = inject(LessonService);

  isPlaying = signal<boolean>(false);
  controlBar = signal<IControlBar | null>(null);
  time = signal<number>(0);

  private _isInitialized = false;

  /**
   * Initialize control bar with type from LessonService
   * Called by LessonContainerComponent after lesson is loaded
   */
  initFromLesson(): void {
    if (this._isInitialized) return;

    const controlBarType = this._lessonService.controlBarType();
    this.controlBar.set(controlBarType);

    console.log('[ControlBarService]:initFromLesson =>', controlBarType);

    // Setup synchronization based on control bar type
    if (controlBarType === 'video-xml') {
      this._initVideoXmlSync();
    } else if (controlBarType === 'video') {
      this._initVideoSync();
    } else if (controlBarType === 'audio-mixer') {
      // Audio mixer initialization if needed
    }

    this._isInitialized = true;
  }

  /**
   * Reset the service state
   */
  reset(): void {
    this._isInitialized = false;
    this.controlBar.set(null);
    this.isPlaying.set(false);
    this.time.set(0);
  }

  /**
   * Initialize video-xml synchronization (video + xml)
   */
  private _initVideoXmlSync(): void {
    console.log('[ControlBarService]:_initVideoXmlSync => init');
    this.syncJWPtoFlat();
    this.syncFlatToJWP();
  }

  /**
   * Initialize video-only sync
   */
  private _initVideoSync(): void {
    this._jwpService.onTimeUpdate((ms) => {
      this.time.set(ms / 1000);
    });
    this._jwpService.onStateChange((state) => {
      this.isPlaying.set(state === 'playing');
    });
  }
  syncJWPtoFlat() {
    this._jwpService.onTimeUpdate((ms) => {
      this.time.set(ms / 1000);
      if (this._flatService.loopMode()) {
        if (this.time() >= this._flatService.loopEnd()!) {
          this._jwpService.seek(this._flatService.loopStart()!);
        }
        return;
      }
      this._flatService.seekTrackTo(this.time());
    });
    //state jwp change
    this._jwpService.onStateChange((state) => {
      switch (state) {
        case 'playing':
          console.log('video-img play');
          this._flatService.play();

          break;
        case 'paused':
          console.log('video-img pause');
          this._flatService.pause();
          break;
        default:
          break;
      }
      this.isPlaying.set(state === 'playing');
    });
  }
  async syncFlatToJWP(): Promise<void> {
    this._flatService.onCursorPosition(async (position) => {
      const time = await this._flatService.findTimeByMeasure(position);
      console.log('[controlBarService]:syncFlatToJWp =>', time ?? 'null');
      console.log('video-img cursor position', position.timePos);
      this._jwpService.seek(time!);
      this._jwpService.pause();
    });
    this._flatService.onRangeSelection(async (selection) => {
      console.log('[controlBarService]:syncFlatToJWp =>', selection);
      if (selection) {
        const startTime = await this._flatService.findTimeByMeasure(
          selection.left,
          true,
        );
        const endTime = await this._flatService.findTimeByMeasure(
          selection.right,
          true,
        );
        this._jwpService.seek(startTime!);

        this._jwpService.pause();
      }
    });
  }
}
