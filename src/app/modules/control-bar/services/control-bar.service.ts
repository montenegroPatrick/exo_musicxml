import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ImgStateService } from '@app/modules/img/services/img.service';
import { VideoImgStateService } from '@app/modules/video-img/services/video-img.service';
import { FlatService } from '@core/services/flat.service';
import { JwpService } from '@core/services/jwp.service';
export type IControlBar = 'audio-mixer' | 'video' | 'video-xml';
@Injectable({
  providedIn: 'root',
})
export class ControlBarService {
  private activatedRoute = inject(ActivatedRoute);
  private _jwpService = inject(JwpService);
  private _flatService = inject(FlatService);
  private imageStateService = inject(ImgStateService);
  private _router = inject(Router);
  isPlaying = signal<boolean>(false);
  controlBar = signal<IControlBar | null>(null);
  time = signal<number>(0);

  constructor() {
    const urlSegments: string[] = this._router.url.split('/');
    const firstSegment = urlSegments[1];
    const secondSegment = urlSegments[2];

    switch (firstSegment) {
      case 'video-img':
        console.log('video-img init videoImg');
        this._initVideoImg();
        this.controlBar.set('video-xml');
        break;
      case 'img':
        console.log('img init img');
        const imgService = inject(ImgStateService);
        const imageType = computed(() => imgService.type());
        if (imageType() != 'xml') {
          this.controlBar.set('video');
          return;
        }
        this.controlBar.set('video-xml');

        break;
      case 'video':
        this.controlBar.set('video');
        break;
      default:
        break;
    }
  }
  protected _initVideoImg(): void {
    const videoService = inject(VideoImgStateService);
    const json = computed(() => videoService.jsonVideo());
    const { typeImg, loadVideo, loadImg, loadAudio } = json() || {};

    if (typeImg === 'xml' && loadVideo) {
      console.log('video-img init videoImg xml');
      this.syncJWPtoFlat();
      this.syncFlatToJWP();
      return;
    }
    if (loadVideo) {
      this.controlBar.set('video');
      this._jwpService.onTimeUpdate((ms) => {
        this.time.set(ms / 1000);
      });
      // this._jwpService.onStateChange((state) => {
      //   this.isPlaying.set(state === 'playing');
      // });
    } else if (loadAudio) {
      this.controlBar.set('audio-mixer');
    }
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
