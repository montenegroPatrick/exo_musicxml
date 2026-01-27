import {
  Component,
  OnDestroy,
  AfterViewInit,
  input,
  output,
  effect,
  inject,
} from '@angular/core';
import { JwpService } from '@core/services/jwp.service';
import {
  JWPlayerInstance,
  IJWPlayerOptions,
  JWPlayerEvent,
  JWPlayerEventCallback,
} from '@core/interfaces/jwplayer.interface';

@Component({
  selector: 'app-video',
  imports: [],
  template: ` <div class="" [id]="playerId"></div> `,
})
export class VideoComponent implements AfterViewInit, OnDestroy {
  private jwpService = inject(JwpService);

  /** Type de la vidéo (video, xml) */
  typeImg = input.required<string>();

  /** ID de la vidéo ou playlist JWPlayer */
  mediaId = input.required<string>();

  /** Options personnalisées pour le player */
  options = input<IJWPlayerOptions>({});

  /** Démarrage automatique */
  autostart = input<boolean>(false);

  /** Afficher les contrôles */
  controls = input<boolean>(false);

  /** Muet par défaut */
  muted = input<boolean>(false);

  /** Event émis quand le player est prêt */
  playerReady = output<JWPlayerInstance>();

  /** Event émis lors d'une erreur */
  playerError = output<Error>();

  readonly playerId = `jwplayer-${Math.random().toString(36).substring(2, 9)}`;

  private isInitialized = false;

  constructor() {
    effect(() => {
      const id = this.mediaId();
      if (this.isInitialized && id) {
        this.jwpService.loadMedia(id);
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      const mergedOptions: IJWPlayerOptions = {
        autostart: this.typeImg() !== 'xml' ? true : this.autostart(),
        controls: this.controls(),
        mute: this.muted(),
        ...this.options(),
      };

      await this.jwpService.initPlayer(
        this.playerId,
        this.mediaId(),
        mergedOptions,
      );
      this.isInitialized = true;

      const player = this.jwpService.getPlayer();
      if (player) {
        this.playerReady.emit(player);
      }
    } catch (error) {
      console.error('Failed to load JWPlayer:', error);
      this.playerError.emit(error as Error);
    }
  }

  ngOnDestroy(): void {
    this.jwpService.destroyPlayer();
    this.isInitialized = false;
  }

  // Public API methods - delegate to service
  play(): void {
    this.jwpService.play();
  }

  pause(): void {
    this.jwpService.pause();
  }

  stop(): void {
    this.jwpService.stop();
  }

  seek(position: number): void {
    this.jwpService.seek(position); // Convert to ms
  }

  setVolume(volume: number): void {
    this.jwpService.setVolume(volume);
  }

  setMute(mute: boolean): void {
    this.jwpService.setMute(mute);
  }

  setPlaybackRate(rate: number): void {
    this.jwpService.setPlaybackRate(rate);
  }

  getPosition(): number {
    return this.jwpService.positionMs() / 1000; // Convert to seconds
  }

  getDuration(): number {
    return this.jwpService.duration() / 1000; // Convert to seconds
  }

  getState(): string {
    return this.jwpService.state();
  }

  on(event: JWPlayerEvent, callback: JWPlayerEventCallback): void {
    this.jwpService.on(event, callback);
  }

  off(event: JWPlayerEvent): void {
    this.jwpService.off(event);
  }

  getPlayer(): JWPlayerInstance | null {
    return this.jwpService.getPlayer();
  }
}
