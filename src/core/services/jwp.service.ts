import {
  computed,
  inject,
  Injectable,
  signal,
  WritableSignal,
  Signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DiapoStateService } from '@core/shared/diapo/services/diapo.service';
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
  private readonly _http = inject(HttpClient);
  private readonly _diapoService = inject(DiapoStateService);

  private _player: JWPlayerInstance | null = null;
  
  // -- Internal State Signals --
  private readonly _isReady = signal<boolean>(false);
  private readonly _positionMs = signal<number>(0);
  private readonly _durationMs = signal<number>(0);
  private readonly _playbackState = signal<JWPlaybackStatus>('idle');
  private readonly _volume = signal<number>(50);
  private readonly _playbackRate = signal<number>(1);

  // -- Loop State --
  private readonly _isLooping = signal<boolean>(false);
  private readonly _loopStart = signal<number | null>(null);
  private readonly _loopEnd = signal<number | null>(null);

  // -- Public Readonly Signals --
  readonly isReady = this._isReady.asReadonly();
  readonly positionMs = this._positionMs.asReadonly();
  readonly duration = this._durationMs.asReadonly(); // Keep alias 'duration' for compatibility
  readonly playbackState = this._playbackState.asReadonly();
  readonly volume = this._volume.asReadonly();
  readonly playbackRate = this._playbackRate.asReadonly();
  readonly isLooping = this._isLooping.asReadonly();
  readonly loopStart = this._loopStart.asReadonly();
  readonly loopEnd = this._loopEnd.asReadonly();
  
  // Compatibility alias for VideoComponent
  readonly state = this.playbackState;
  
  readonly isXml = computed(() => this._diapoService.type() === 'xml');

  private _timeCallbacks: ((ms: number) => void)[] = [];
  private _stateCallbacks: ((state: JWPlaybackStatus) => void)[] = [];

  constructor() {}

  async initPlayer(
    containerId: string,
    mediaId: string,
    options: IJWPlayerOptions = {},
  ): Promise<void> {
    // Wait for the library to load
    let retryCount = 0;
    while (!(window as any).jwplayer && retryCount < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      retryCount++;
    }

    const jwplayer = (window as any).jwplayer;
    if (!jwplayer) {
      throw new Error('JWPlayer library not loaded');
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
        this._durationMs.set(this._player.getDuration() * 1000);
        this._volume.set(this._player.getVolume());
        
        // Re-attach listeners
        this._attachListeners();

        if (options.autostart) {
          this._player.play();
        }
      }
    });

    this._player?.on('error', (err: any) => {
      console.error('[JwpService]: Player error', err);
      this._isReady.set(false);
    });
  }

  private _attachListeners(): void {
    if (!this._player) return;

    this._player.on('time', (event: any) => {
      const seconds = event.position;
      const ms = seconds * 1000;
      this._positionMs.set(ms);

      // -- Loop Logic --
      if (this._isLooping() && this._loopEnd() !== null) {
        if (seconds >= this._loopEnd()!) {
           console.log(`[JwpService] Loop trigger: ${seconds}s >= ${this._loopEnd()}s. Seeking to ${this._loopStart()}s`);
           this.seek(this._loopStart() || 0);
           return;
        }
      }

      this._timeCallbacks.forEach(cb => cb(ms));
    });

    this._player.on('play', () => {
      this._playbackState.set('playing');
      this._stateCallbacks.forEach(cb => cb('playing'));
    });

    this._player.on('pause', () => {
      this._playbackState.set('paused');
      this._stateCallbacks.forEach(cb => cb('paused'));
    });

    this._player.on('buffer', () => {
      this._playbackState.set('buffering');
      this._stateCallbacks.forEach(cb => cb('buffering'));
    });

    this._player.on('idle', () => {
      this._playbackState.set('idle');
      this._stateCallbacks.forEach(cb => cb('idle'));
    });

    this._player.on('complete', () => {
      this._playbackState.set('complete');
      this._stateCallbacks.forEach(cb => cb('complete'));
    });
  }

  loadMedia(mediaId: string, autostart: boolean = true): void {
    if (!this._player) return;

    const playlistUrl = `https://content.jwplatform.com/v2/media/${mediaId}`;
    
    this._positionMs.set(0);
    this._durationMs.set(0);

    this._player.load(playlistUrl);

    const onPlaylistItem = () => {
      if (this._player) {
        const d = this._player.getDuration() * 1000;
        if (d > 0) {
          this._durationMs.set(d);
          this._player.off('playlistItem', onPlaylistItem);
        }
      }
    };
    this._player.on('playlistItem', onPlaylistItem);

    if (autostart) {
      this._player.play();
    }
  }

  play(): void {
    this._player?.play();
  }

  pause(): void {
    this._player?.pause();
  }

  togglePlay(): void {
    this.playbackState() === 'playing' ? this.pause() : this.play();
  }

  stop(): void {
    this._player?.stop();
    this._positionMs.set(0);
  }

  seek(position: number): void {
    this._player?.seek(position);
  }

  setLoopRange(start: number | null, end: number | null): void {
    if (start === null || end === null) {
      this._isLooping.set(false);
      this._loopStart.set(null);
      this._loopEnd.set(null);
    } else {
      this._isLooping.set(true);
      this._loopStart.set(start);
      this._loopEnd.set(end);
    }
  }

  setVolume(volume: number): void {
    this._player?.setVolume(volume);
    this._volume.set(volume);
  }

  setMute(mute: boolean): void {
    this._player?.setMute(mute);
  }

  setPlaybackRate(rate: number): void {
    this._player?.setPlaybackRate(rate);
    this._playbackRate.set(rate);
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

  onTimeUpdate(callback: (ms: number) => void): void {
    this._timeCallbacks.push(callback);
    this._player?.on('time', (event: any) => callback(event.position * 1000));
  }

  onStateChange(callback: (state: JWPlaybackStatus) => void): void {
    this._stateCallbacks.push(callback);
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
      this._playbackState.set('idle');
    }
  }

  getPlayer(): JWPlayerInstance | null {
    return this._player;
  }
}
