import {
  Component,
  OnDestroy,
  AfterViewInit,
  input,
  output,
  effect,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { JwpService, JWPlaybackStatus } from '@core/services/jwp.service';
import {
  JWPlayerInstance,
  IJWPlayerOptions,
  JWPlayerEvent,
  JWPlayerEventCallback,
} from '@core/interfaces/jwplayer.interface';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="video-container" 
      [style.aspect-ratio]="mode() === 'fixed-ratio' ? '16/9' : 'initial'"
      [style.height]="mode() === 'fill' ? '100%' : 'auto'"
      (click)="handleSingleClick()" 
      (dblclick)="handleDoubleClick()"
    >
      <div [id]="playerId" class="jwplayer-wrapper"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .video-container {
      width: 100%;
      height: 100%;
      position: relative;
      background: black;
      overflow: hidden;
      cursor: pointer;
    }

    .jwplayer-wrapper {
      width: 100%;
      height: 100%;
    }

    :host ::ng-deep .jwplayer {
      position: absolute !important;
      top: 0 !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
    }

    :host ::ng-deep .jw-logo {
      transform: scale(0.6) !important;
      transform-origin: top left !important;
      opacity: 0.7 !important;
    }
  `],
})
export class VideoComponent implements AfterViewInit, OnDestroy {
  private readonly _jwpService = inject(JwpService);

  // -- Inputs --
  typeImg = input.required<string>();
  mediaId = input.required<string>();
  mode = input<'fixed-ratio' | 'fill'>('fill');
  options = input<IJWPlayerOptions>({});
  autostart = input<boolean>(false);
  controls = input<boolean>(false);
  muted = input<boolean>(false);

  // -- Outputs --
  playerReady = output<JWPlayerInstance>();
  playerError = output<Error>();

  readonly playerId = `jwplayer-${Math.random().toString(36).substring(2, 9)}`;

  private _isInitialized = false;
  private _clickTimer: any = null;

  constructor() {
    // React to media changes
    effect(() => {
      const id = this.mediaId();
      if (this._isInitialized && id) {
        const shouldAutostart = this.typeImg() !== 'xml' ? true : this.autostart();
        this._jwpService.loadMedia(id, shouldAutostart);
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      const mergedOptions: IJWPlayerOptions = {
        autostart: this.typeImg() !== 'xml' ? true : this.autostart(),
        controls: this.controls(),
        mute: this.muted(),
        width: '100%',
        height: '100%',
        stretching: 'uniform',
        ...this.options(),
      };

      await this._jwpService.initPlayer(
        this.playerId,
        this.mediaId(),
        mergedOptions,
      );
      this._isInitialized = true;

      const player = this._jwpService.getPlayer();
      if (player) {
        this.playerReady.emit(player);
      }
    } catch (error) {
      console.error('[VideoComponent]: Initialization failed', error);
      this.playerError.emit(error as Error);
    }
  }

  handleSingleClick(): void {
    if (this._clickTimer) return;
    
    this._clickTimer = setTimeout(() => {
      this._jwpService.togglePlay();
      this._clickTimer = null;
    }, 250);
  }

  handleDoubleClick(): void {
    if (this._clickTimer) {
      clearTimeout(this._clickTimer);
      this._clickTimer = null;
    }
    this._jwpService.toggleFullscreen();
  }

  ngOnDestroy(): void {
    if (this._clickTimer) clearTimeout(this._clickTimer);
    this._jwpService.destroyPlayer();
    this._isInitialized = false;
  }

  // Delegate API methods to service
  play(): void { this._jwpService.play(); }
  pause(): void { this._jwpService.pause(); }
  stop(): void { this._jwpService.stop(); }
  seek(pos: number): void { this._jwpService.seek(pos); }
  setVolume(vol: number): void { this._jwpService.setVolume(vol); }
  setMute(mute: boolean): void { this._jwpService.setMute(mute); }
  setPlaybackRate(rate: number): void { this._jwpService.setPlaybackRate(rate); }
  
  getPosition(): number { return this._jwpService.positionMs() / 1000; }
  getDuration(): number { return this._jwpService.duration() / 1000; }
  getState(): JWPlaybackStatus { return this._jwpService.playbackState(); }

  on(event: JWPlayerEvent, cb: JWPlayerEventCallback): void { this._jwpService.on(event, cb); }
  off(event: JWPlayerEvent): void { this._jwpService.off(event); }
  getPlayer(): JWPlayerInstance | null { return this._jwpService.getPlayer(); }
}
