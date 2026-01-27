import { Injectable, signal, computed, inject } from '@angular/core';
import { environment } from '@environments/environment';
import {
  JWPlayerInstance,
  IJWPlayerOptions,
  JWPlayerEvent,
  JWPlayerEventCallback,
  JWPlayerEventParams,
} from '@core/interfaces/jwplayer.interface';
import { PlaybackState } from '@core/interfaces/playback.interface';
import { FlatService } from './flat.service';
import { ImgStateService } from '@app/modules/img/services/img.service';

const JW_PLAYER_LIBRARY_URL = `https://cdn.jwplayer.com/libraries/7cZe2fzm.js`;

@Injectable({ providedIn: 'root' })
export class JwpService {
  // Private state
  private playerInstance: JWPlayerInstance | null = null;

  private isInitialized = false;
  private static scriptLoaded = false;
  private static scriptLoading: Promise<void> | null = null;
  private currentContainerId: string | null = null;
  private _flatService = inject(FlatService);
  private _imgService = inject(ImgStateService);

  // Event callbacks
  private timeUpdateCallbacks: Set<(ms: number) => void> = new Set();
  private stateChangeCallbacks: Set<(state: PlaybackState) => void> = new Set();

  // Reactive signals
  private readonly _positionMs = signal<number>(0);
  private readonly _duration = signal<number>(0);
  private readonly _isPlaying = signal<boolean>(false);
  private readonly _state = signal<PlaybackState>('idle');
  private readonly _isReady = signal<boolean>(false);
  private readonly _isXml = computed(() => this._imgService.type() === 'xml');
  // Public readonly signals
  readonly positionMs = this._positionMs.asReadonly();
  readonly duration = this._duration.asReadonly();
  readonly isPlaying = this._isPlaying.asReadonly();
  readonly state = this._state.asReadonly();
  readonly isReady = this._isReady.asReadonly();

  /**
   * Initialize the JW Player in a container
   */
  async initPlayer(
    containerId: string,
    mediaId: string,

    options: Partial<IJWPlayerOptions> = {},
  ): Promise<void> {
    await this.loadJWPlayerScript();

    if (typeof window.jwplayer === 'undefined') {
      throw new Error('JWPlayer not available');
    }

    // Destroy previous instance if exists
    if (this.playerInstance) {
      this.destroyPlayer();
    }
    if (this._isXml()) {
      while (!this._flatService.isReady()) {
        console.log('Flat is not ready');
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    this.currentContainerId = containerId;

    const defaultOptions: IJWPlayerOptions = {
      abouttext: 'imusic-school',
      key: environment.JW_PLAYER_USER_KEY,
      height: 360,
      width: '100%',
      allowFullscreen: true,
      aspectratio: '16:9',
      autostart: false,
      controls: false,
      displaydescription: false,
      displaytitle: false,
      mute: false,
      playbackRateControls: true,
      playbackRates: [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2],
      preload: 'metadata',
      repeat: false,
      stretching: 'uniform',
      logo: {
        file: 'https://assets-jpcust.jwpsrv.com/watermarks/gxTrgdrk.png',
        hide: false,
        link: 'https://www.imusic-school.com',
        position: 'top-left',
      },
      playlist: this.getPlaylistUrl(mediaId),
    };

    const mergedOptions = { ...defaultOptions, ...options };

    this.playerInstance = window.jwplayer(containerId).setup(mergedOptions);
    this.isInitialized = true;
    this._isReady.set(true);

    this.setupEventListeners();

    return new Promise<void>((resolve) => {
      this.playerInstance!.on('ready', () => {
        resolve();
      });
    });
  }

  /**
   * Destroy the player instance
   */
  destroyPlayer(): void {
    if (this.playerInstance) {
      this.playerInstance.remove();
      this.playerInstance = null;
      this.isInitialized = false;
      this.currentContainerId = null;
      this._positionMs.set(0);
      this._duration.set(0);
      this._isPlaying.set(false);
      this._state.set('idle');
    }
  }

  /**
   * Load a new media by ID
   */
  loadMedia(mediaId: string): void {
    if (this.playerInstance) {
      this.playerInstance.load(this.getPlaylistUrl(mediaId));
    }
  }

  // Playback controls
  play(): void {
    if (!this.playerInstance) return;

    this.playerInstance?.play();
  }

  pause(): void {
    this.playerInstance?.pause();
  }

  stop(): void {
    this.playerInstance?.stop();
  }

  seek(positionMs: number): void {
    this.playerInstance?.seek(positionMs);
  }

  setVolume(volume: number): void {
    this.playerInstance?.setVolume(volume);
  }

  setMute(mute: boolean): void {
    this.playerInstance?.setMute(mute);
  }

  setPlaybackRate(rate: number): void {
    this.playerInstance?.setPlaybackRate(rate);
  }

  // Captions/Subtitles
  enableCaptions(trackId: string): void {
    const tracks = this.playerInstance?.getCaptionsList() || [];
    const trackIndex = tracks.findIndex(
      (t: any) => t.id === trackId || t.language === trackId,
    );
    if (trackIndex >= 0) {
      this.playerInstance?.setCurrentCaptions(trackIndex);
    }
  }

  disableCaptions(): void {
    this.playerInstance?.setCurrentCaptions(0); // 0 = off
  }

  getCaptionsList(): any[] {
    return this.playerInstance?.getCaptionsList() || [];
  }

  // Fullscreen
  enterFullscreen(): void {
    this.playerInstance?.setFullscreen(true);
  }

  exitFullscreen(): void {
    this.playerInstance?.setFullscreen(false);
  }

  toggleFullscreen(): void {
    const isFullscreen = this.playerInstance?.getFullscreen() || false;
    this.playerInstance?.setFullscreen(!isFullscreen);
  }

  // Event subscriptions
  onTimeUpdate(callback: (ms: number) => void): () => void {
    this.timeUpdateCallbacks.add(callback);
    return () => this.timeUpdateCallbacks.delete(callback);
  }

  onStateChange(callback: (state: PlaybackState) => void): () => void {
    this.stateChangeCallbacks.add(callback);
    return () => this.stateChangeCallbacks.delete(callback);
  }

  /**
   * Register a raw JW Player event listener
   */
  on(event: JWPlayerEvent, callback: JWPlayerEventCallback): void {
    this.playerInstance?.on(event, callback);
  }

  /**
   * Remove a raw JW Player event listener
   */
  off(event: JWPlayerEvent): void {
    this.playerInstance?.off(event);
  }

  /**
   * Get the raw player instance (for advanced use cases)
   */
  getPlayer(): JWPlayerInstance | null {
    return this.playerInstance;
  }

  // Private methods
  private loadJWPlayerScript(): Promise<void> {
    if (JwpService.scriptLoaded) {
      return Promise.resolve();
    }

    if (JwpService.scriptLoading) {
      return JwpService.scriptLoading;
    }

    JwpService.scriptLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = JW_PLAYER_LIBRARY_URL;
      script.async = true;

      script.onload = () => {
        JwpService.scriptLoaded = true;
        JwpService.scriptLoading = null;
        resolve();
      };

      script.onerror = () => {
        JwpService.scriptLoading = null;
        reject(new Error('Failed to load JWPlayer script'));
      };

      document.head.appendChild(script);
    });

    return JwpService.scriptLoading;
  }

  private getPlaylistUrl(mediaId: string): string {
    return `//content.jwplatform.com/v2/media/${mediaId}`;
  }

  private setupEventListeners(): void {
    if (!this.playerInstance) return;

    // Time update
    this.playerInstance.on('time', (params: JWPlayerEventParams) => {
      const positionMs = (params.position ?? 0) * 1000;
      const durationMs = (params.duration ?? 0) * 1000;
      this._positionMs.set(positionMs);
      this._duration.set(durationMs);
      this.timeUpdateCallbacks.forEach((cb) => cb(positionMs));
    });

    // State changes
    this.playerInstance.on('play', () => {
      this._state.set('playing');
      this._isPlaying.set(true);
      console.log(
        '[JWPSERVICE]: statechange event => ',
        this.stateChangeCallbacks,
      );
      console.log(
        '[JWPSERVICE]: statechange event => ',
        this._flatService.isReady(),
      );
      this.stateChangeCallbacks.forEach((cb) => cb(this._state()));
    });

    this.playerInstance.on('pause', () => {
      this._isPlaying.set(false);
      this._state.set('paused');
      this.stateChangeCallbacks.forEach((cb) => cb(this._state()));
    });

    this.playerInstance.on('idle', () => {
      this._isPlaying.set(false);
      this._state.set('idle');
      this.stateChangeCallbacks.forEach((cb) => cb(this._state()));
    });

    this.playerInstance.on('buffer', () => {
      this._state.set('buffering');
      this.stateChangeCallbacks.forEach((cb) => cb(this._state()));
    });

    this.playerInstance.on('complete', () => {
      this._isPlaying.set(false);
      this._state.set('complete');
      this.stateChangeCallbacks.forEach((cb) => cb('complete'));
    });
  }
}
