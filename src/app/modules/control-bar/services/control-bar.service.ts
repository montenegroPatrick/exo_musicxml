import { effect, inject, Injectable, signal, untracked } from '@angular/core';
import { FlatService } from '@core/services/flat.service';
import { JwpService } from '@core/services/jwp.service';
import { ControlBarType } from '@core/interfaces/lesson.interface';
import { AudioService } from '@core/services/audio.service';
import { CoreDataService } from '@core/services/core-data.service';

export type IControlBar = ControlBarType;

@Injectable({
  providedIn: 'root',
})
export class ControlBarService {
  private _jwpService = inject(JwpService);
  private _flatService = inject(FlatService);
  private _audioService = inject(AudioService);
  private _coreData = inject(CoreDataService);

  // -- Internal State Signals --
  private readonly _isPlaying = signal<boolean>(false);
  private readonly _controlBar = signal<IControlBar | null>(null);
  private readonly _time = signal<number>(0);
  private readonly _flag = signal<boolean>(false);

  // -- Public Readonly Signals --
  readonly isPlaying = this._isPlaying.asReadonly();
  readonly controlBar = this._controlBar.asReadonly();
  readonly time = this._time.asReadonly();
  
  private _isInitialized = false;

  constructor() {
    // Sync playback state reactively
    effect(() => {
      this._isPlaying.set(this._audioService.isPlaying() || this._flatService.isPlaying());
    }, { allowSignalWrites: true });

    // Sync loop logic and time reactively
    effect(() => {
      const audioTime = this._audioService.currentTime();
      const flatTime = this._flatService.time();
      this._time.set(audioTime || flatTime);
    }, { allowSignalWrites: true });

    // Reactive Mode Initialization
    effect(() => {
      const controlBarType = this._coreData.controlBarType();
      const lesson = this._coreData.lessonJson();
      
      if (lesson) {
        untracked(() => {
          console.log('[ControlBarService] Reactive Init Mode:', controlBarType);
          this._controlBar.set(controlBarType);
          this._setupSyncForMode(controlBarType);
        });
      }
    }, { allowSignalWrites: true });
  }

  initFromLesson(): void {
    // This is now handled by the effect, but kept for legacy calls
    console.log('[ControlBarService] initFromLesson called (legacy)');
  }

  private _setupSyncForMode(type: IControlBar): void {
    switch (type) {
      case 'video-xml':
        this._initVideoXmlSync();
        break;
      case 'video':
        this._initVideoSync();
        break;
      case 'audio-mixer':
        this._initAudioMixerSync();
        break;
    }
  }

  reset(): void {
    this._isInitialized = false;
    this._controlBar.set(null);
    this._isPlaying.set(false);
    this._time.set(0);
  }

  private _initAudioMixerSync(): void {
    // La synchronisation est désormais gérée par FlatService et AudioService en interne.
    // ControlBarService ne fait que suivre l'état via les effets du constructeur.
  }

  private _initVideoXmlSync(): void {
    this.syncJWPtoFlat();
    this.syncFlatToJWP();
  }

  private _initVideoSync(): void {
    this._jwpService.onTimeUpdate((ms) => {
      this._time.set(ms / 1000);
    });
    this._jwpService.onStateChange((state) => {
      this._isPlaying.set(state === 'playing');
    });
  }

  syncJWPtoFlat(): void {
    this._jwpService.onTimeUpdate((ms) => {
      const time = ms / 1000;
      this._time.set(time);
      
      if (this._flatService.loopMode()) {
        const start = this._flatService.loopStart();
        const end = this._flatService.loopEnd();
        if (start !== undefined && start !== null && end !== undefined && end !== null && time >= end) {
          this._jwpService.seek(start);
        }
        return;
      }
      this._flatService.seekTrackTo(time);
    });

    this._jwpService.onStateChange((state) => {
      if (state === 'playing') {
        this._flatService.play();
      } else if (state === 'paused') {
        this._flatService.pause();
      }
      this._isPlaying.set(state === 'playing');
    });
  }

  async syncFlatToJWP(): Promise<void> {
    this._flatService.onCursorPosition(async (position: any) => {
      const time = await this._flatService.findTimeByMeasure(position);
      if (time !== undefined && time !== null) {
        this._jwpService.seek(time);
        this._jwpService.pause();
      }
    });

    this._flatService.onRangeSelection(async (selection: any) => {
      if (selection) {
        const startTime = await this._flatService.findTimeByMeasure(selection.left, true);
        if (startTime !== undefined && startTime !== null) {
          this._jwpService.seek(startTime);
          this._jwpService.pause();
        }
      }
    });
  }
}
