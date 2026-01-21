import {
  Component,
  OnDestroy,
  AfterViewInit,
  input,
  output,
  effect,
} from '@angular/core';
import { environment } from '@environments/environment';
import {
  JWPlayerInstance,
  IJWPlayerOptions,
  JWPlayerEvent,
  JWPlayerEventCallback,
} from '@core/interfaces/jwplayer.interface';

const JW_PLAYER_LIBRARY_URL = `https://cdn.jwplayer.com/libraries/7cZe2fzm.js`;

@Component({
  selector: 'app-video',
  imports: [],
  template: ` <div class="h-full  w-full" [id]="playerId"></div> `,
})
export class VideoComponent implements AfterViewInit, OnDestroy {
  /** ID de la vidéo ou playlist JWPlayer */
  mediaId = input.required<string>();

  /** Options personnalisées pour le player */
  options = input<IJWPlayerOptions>({});

  /** Démarrage automatique */
  autostart = input<boolean>(false);

  /** Afficher les contrôles */
  controls = input<boolean>(true);

  /** Muet par défaut */
  muted = input<boolean>(false);

  /** Event émis quand le player est prêt */
  playerReady = output<JWPlayerInstance>();

  /** Event émis lors d'une erreur */
  playerError = output<Error>();

  readonly playerId = `jwplayer-${Math.random().toString(36).substring(2, 9)}`;

  private playerInstance: JWPlayerInstance | null = null;
  private isInitialized = false;
  private static scriptLoaded = false;
  private static scriptLoading: Promise<void> | null = null;

  constructor() {
    effect(() => {
      const id = this.mediaId();
      if (this.isInitialized && id) {
        this.loadMedia(id);
      }
    });
  }

  ngAfterViewInit(): void {
    this.loadScriptAndInitPlayer();
  }

  ngOnDestroy(): void {
    this.destroyPlayer();
  }

  private async loadScriptAndInitPlayer(): Promise<void> {
    try {
      await this.loadJWPlayerScript();
      this.initPlayer();
    } catch (error) {
      console.error('Failed to load JWPlayer:', error);
      this.playerError.emit(error as Error);
    }
  }

  private loadJWPlayerScript(): Promise<void> {
    if (VideoComponent.scriptLoaded) {
      return Promise.resolve();
    }

    if (VideoComponent.scriptLoading) {
      return VideoComponent.scriptLoading;
    }

    VideoComponent.scriptLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = JW_PLAYER_LIBRARY_URL;
      script.async = true;

      script.onload = () => {
        VideoComponent.scriptLoaded = true;
        VideoComponent.scriptLoading = null;
        resolve();
      };

      script.onerror = () => {
        VideoComponent.scriptLoading = null;
        reject(new Error('Failed to load JWPlayer script'));
      };

      document.head.appendChild(script);
    });

    return VideoComponent.scriptLoading;
  }

  private initPlayer(): void {
    if (typeof window.jwplayer === 'undefined') {
      console.error('JWPlayer not available');
      this.playerError.emit(new Error('JWPlayer not available'));
      return;
    }

    const defaultOptions: IJWPlayerOptions = {
      abouttext: 'imusic-school',
      key: environment.JW_PLAYER_USER_KEY,
      height: '40%',
      width: '90%',
      allowFullscreen: true,
      aspectratio: '16:9',
      autostart: this.autostart(),
      controls: this.controls(),
      displaydescription: false,
      displaytitle: false,
      mute: this.muted(),
      playbackRateControls: true,
      playbackRates: [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2],
      preload: 'metadata',
      repeat: false,
      stretching: 'exactfit',
    };

    const mergedOptions = { ...defaultOptions, ...this.options() };

    const setupConfig: IJWPlayerOptions = {
      ...mergedOptions,
      abouttext: 'imusic-school',
      key: environment.JW_PLAYER_USER_KEY,
      logo: {
        file: 'https://assets-jpcust.jwpsrv.com/watermarks/gxTrgdrk.png',
        hide: false,
        link: 'https://www.imusic-school.com',
        margin: '10',
        position: 'top-left',
      },
      playlist: this.getPlaylistUrl(this.mediaId()),
    };

    this.playerInstance = window.jwplayer(this.playerId).setup(setupConfig);
    this.isInitialized = true;

    this.playerInstance.on('ready', () => {
      this.playerReady.emit(this.playerInstance!);
    });
  }

  private loadMedia(mediaId: string): void {
    if (this.playerInstance) {
      this.playerInstance.load(this.getPlaylistUrl(mediaId));
    }
  }

  private getPlaylistUrl(mediaId: string): string {
    return `//content.jwplatform.com/v2/media/${mediaId}`;
  }

  private destroyPlayer(): void {
    if (this.playerInstance) {
      this.playerInstance.remove();
      this.playerInstance = null;
      this.isInitialized = false;
    }
  }

  // Public API methods
  play(): void {
    this.playerInstance?.play();
  }

  pause(): void {
    this.playerInstance?.pause();
  }

  stop(): void {
    this.playerInstance?.stop();
  }

  seek(position: number): void {
    this.playerInstance?.seek(position);
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

  getPosition(): number {
    return this.playerInstance?.getPosition() ?? 0;
  }

  getDuration(): number {
    return this.playerInstance?.getDuration() ?? 0;
  }

  getState(): string {
    return this.playerInstance?.getState() ?? 'idle';
  }

  on(event: JWPlayerEvent, callback: JWPlayerEventCallback): void {
    this.playerInstance?.on(event, callback);
  }

  off(event: JWPlayerEvent): void {
    this.playerInstance?.off(event);
  }

  getPlayer(): JWPlayerInstance | null {
    return this.playerInstance;
  }
}
