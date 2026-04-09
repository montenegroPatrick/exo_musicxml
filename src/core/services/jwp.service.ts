import {
  computed,
  inject,
  Injectable,
  signal,
  WritableSignal,
  Signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DiapoStateService } from '@app/modules/diapo/services/diapo.service';
import {
  JWPlayerEvent,
  JWPlayerEventCallback,
  JWPlayerInstance,
  IJWPlayerOptions,
} from '@core/interfaces/jwplayer.interface';
import { environment } from '../../environments/environment';

export type JWPlaybackStatus =
  | 'idle'
  | 'buffering'
  | 'playing'
  | 'paused'
  | 'complete';

@Injectable({
  providedIn: 'root',
})
export class JwpService {
  private _http = inject(HttpClient);
  private _diapoService = inject(DiapoStateService);

  private _player: JWPlayerInstance | null = null;
  private _isReady: WritableSignal<boolean> = signal(false);
  private _isXml = computed(() => this._diapoService.type() === 'xml');

  // Shared signals
  readonly isReady: Signal<boolean> = this._isReady;
  readonly isXml: Signal<boolean> = this._isXml;
  readonly positionMs = signal<number>(0);
  readonly duration = signal<number>(0);
  readonly playbackState = signal<JWPlaybackStatus>('idle');
  readonly volume = signal<number>(50);
  readonly playbackRate = signal<number>(1);

  // Compatibility alias for VideoComponent
  readonly state = this.playbackState;

  private _timeCallbacks: ((ms: number) => void)[] = [];
  private _stateCallbacks: ((state: JWPlaybackStatus) => void)[] = [];

  constructor() {}

  async initPlayer(
    containerId: string,
    mediaId: string,
    options: IJWPlayerOptions = {},
  ): Promise<void> {
    // Wait up to 5 seconds for the library to load
    let retryCount = 0;
    while (!(window as any).jwplayer && retryCount < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      retryCount++;
    }

    const jwplayer = (window as any).jwplayer;
    if (!jwplayer) {
      throw new Error('JWPlayer library not loaded after waiting');
    }

    const playlistUrl = `https://content.jwplatform.com/v2/media/${mediaId}`;

    this._player = jwplayer(containerId).setup({
      playlist: playlistUrl,
      key: environment.JW_PLAYER_USER_KEY,
      autostart: options.autostart ?? true,
      mute: options.autostart ? true : (options.mute ?? false),
      ...options,
    });

    this._player?.on('ready', () => {
      this._isReady.set(true);
      if (this._player) {
        this.duration.set(this._player.getDuration() * 1000);
        this.volume.set(this._player.getVolume());
        
        // RE-ATTACH QUEUED LISTENERS
        this._attachListeners();

        // FORCE AUTOPLAY IF REQUESTED
        if (options.autostart) {
          console.log('[JwpService]: Forcing autoplay');
          this._player.play();
        }
      }
    });
  }

  private _attachListeners(): void {
    if (!this._player) return;

    this._player.on('time', (event: any) => {
      const ms = event.position * 1000;
      this.positionMs.set(ms);
      this._timeCallbacks.forEach(cb => cb(ms));
    });

    this._player.on('play', () => {
      this.playbackState.set('playing');
      this._stateCallbacks.forEach(cb => cb('playing'));
    });

    this._player.on('pause', () => {
      this.playbackState.set('paused');
      this._stateCallbacks.forEach(cb => cb('paused'));
    });

    this._player.on('buffer', () => {
      this.playbackState.set('buffering');
      this._stateCallbacks.forEach(cb => cb('buffering'));
    });

    this._player.on('idle', () => {
      this.playbackState.set('idle');
      this._stateCallbacks.forEach(cb => cb('idle'));
    });

    this._player.on('complete', () => {
      this.playbackState.set('complete');
      this._stateCallbacks.forEach(cb => cb('complete'));
    });
  }

  loadMedia(mediaId: string): void {
    const playlistUrl = `https://content.jwplatform.com/v2/media/${mediaId}`;
    this._player?.load(playlistUrl);
  }

  play(): void {
    this._player?.play();
  }

  pause(): void {
    this._player?.pause();
  }

  togglePlay(): void {
    if (this.playbackState() === 'playing') {
      this.pause();
    } else {
      this.play();
    }
  }

  stop(): void {
    this._player?.stop();
    this.positionMs.set(0);
  }

  seek(position: number): void {
    this._player?.seek(position);
  }

  setVolume(volume: number): void {
    this._player?.setVolume(volume);
    this.volume.set(volume);
  }

  setMute(mute: boolean): void {
    this._player?.setMute(mute);
  }

  setPlaybackRate(rate: number): void {
    this._player?.setPlaybackRate(rate);
    this.playbackRate.set(rate);
  }

  enterFullscreen(): void {
    this._player?.setFullscreen(true);
  }

  exitFullscreen(): void {
    this._player?.setFullscreen(false);
  }

  toggleFullscreen(): void {
    if (this._player) {
      const isFs = this._player.getFullscreen();
      this._player.setFullscreen(!isFs);
    }
  }

  // Event helpers - Now they store callbacks if player is not ready
  onTimeUpdate(callback: (ms: number) => void): void {
    this._timeCallbacks.push(callback);
    // If player already exists, attach it immediately too
    this._player?.on('time', (event: any) => callback(event.position * 1000));
  }

  onStateChange(callback: (state: JWPlaybackStatus) => void): void {
    this._stateCallbacks.push(callback);
    // If player already exists, attach them immediately
    if (this._player) {
      this._player.on('play', () => callback('playing'));
      this._player.on('pause', () => callback('paused'));
      this._player.on('buffer', () => callback('buffering'));
      this._player.on('idle', () => callback('idle'));
      this._player.on('complete', () => callback('complete'));
    }
  }

  on(event: JWPlayerEvent, callback: JWPlayerEventCallback): void {
    this._player?.on(event as any, callback);
  }

  off(event: JWPlayerEvent): void {
    this._player?.off(event as any);
  }

  destroyPlayer(): void {
    if (this._player) {
      this._player.remove();
      this._player = null;
      this._isReady.set(false);
    }
  }

  getPlayer(): JWPlayerInstance | null {
    return this._player;
  }
}
