import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { environment } from '@environments/environment';
import Embed from 'flat-embed';
import {
  EmbedOptions,
  MeasureDetails,
  Part,
} from '@core/interfaces/playback.interface';
import { Sync } from '@core/interfaces/lesson.interface';
import { LessonService } from '@app/modules/lesson/services/lesson.service';
import { CoreDataService } from './core-data.service';
import { AudioService } from './audio.service';

export interface RangeSelection {
  left: any;
  right: any;
}

export interface LoopBounds {
  start: number | null;
  end: number | null;
}

@Injectable({ providedIn: 'root' })
export class FlatService {
  private _lessonService = inject(LessonService);
  private _coreDataStore = inject(CoreDataService);
  private _audioService = inject(AudioService);
  private embed: any | undefined;
  private readonly TRACK_ID = 'external-1';
  private _lastSyncedTime = 0;
  private _lastWarningTime = 0;

  // Event callbacks
  private cursorPositionCallbacks: Set<(position: any) => void> = new Set();
  private rangeSelectionCallbacks: Set<(selection: any | null) => void> = new Set();
  private playCallbacks: Set<() => void> = new Set();
  private pauseCallbacks: Set<() => void> = new Set();
  private stopCallbacks: Set<() => void> = new Set();

  // Reactive signals
  private readonly _isReady = signal<boolean>(false);
  private readonly _isPlaying = signal<boolean>(false);
  private readonly _isTrackReady = signal<boolean>(false);

  // Public readonly signals
  readonly isReady = this._isReady.asReadonly();
  readonly isPlaying = this._isPlaying.asReadonly();

  readonly lessonJson = this._coreDataStore.lessonJson;
  readonly diapoType = computed(() => this._lessonService.diapoType());
  readonly syncPoints = computed(() => {
    const sync = this._coreDataStore.syncPoints();
    const speed = this._audioService.playbackRate();
    if (speed === 1) return sync;
    return sync.map(p => ({ ...p, time: p.time / speed }));
  });
  
  readonly totalTime = computed(() => {
    const totalDuration = this._coreDataStore.totalTime();
    const speed = this._audioService.playbackRate();
    return totalDuration / speed;
  });

  // Measure tracking
  readonly measuresUuids = signal<string[]>([]);
  readonly nbMeasures = signal<number>(0);
  readonly measurePoints = signal<number[]>([]);
  readonly measureDetails = signal<MeasureDetails | null>(null);

  // Loop management
  readonly loopMode = signal<boolean>(false);
  readonly loopStart = signal<number | null>(null);
  readonly loopEnd = signal<number | null>(null);

  // Speed management
  private readonly _currentSpeed = signal<number>(1);
  readonly currentSpeed = this._currentSpeed.asReadonly();

  constructor() {
    // 2. Playback Speed Sync
    effect(() => {
      const rate = this._audioService.playbackRate();
      if (this.isReady()) {
        untracked(() => this.setPlaybackSpeed(rate));
      }
    });

    // 3. Reactive Track Initialization
    effect(() => {
      const sync = this.syncPoints();
      const ready = this.isReady();
      // console.log(`[FlatService:Effect] Ready: ${ready}, SyncPoints: ${sync.length}`);
      if (ready && sync.length > 0 && this.embed) {
        untracked(() => this.setupTrack());
      }
    });
  }

  /**
   * Main Synchronization Hook
   */
  syncWithAudio(audioTime: number, isPlaying: boolean): void {
    if (!this.embed) return;
    
    const sync = this.syncPoints();
    
    if (!sync || sync.length === 0) {
      // console.warn(`[FlatService] Waiting for sync points...`);
      return;
    }

    const startTime = sync[0].time;

    // 1. Handle Play/Pause state
    if (isPlaying && audioTime >= startTime) {
      if (!this._isPlaying()) {
        this._isPlaying.set(true);
        this.embed.play().catch(() => {});
      }
    } else {
      if (this._isPlaying()) {
        this._isPlaying.set(false);
        this.embed.pause().catch(() => {});
      }
    }

    // 2. Position Sync
    // Même avant le début (startTime), on force la position à 0 pour éviter la dérive
    const targetFlatTime = audioTime < startTime ? 0 : audioTime;
    const delta = Math.abs(targetFlatTime - this._lastSyncedTime);
    
    // Seuil réduit à 20ms pour plus de précision
    if (delta > 0.02) {
      this._lastSyncedTime = targetFlatTime;
      this.embed.call('seekTrackTo', { time: targetFlatTime }).catch(() => {});
    }
  }

  onAudioPlay(): void {
    if (!this.embed) return;
    
    const sync = this.syncPoints();
    const startTime = sync.length > 0 ? sync[0].time : 0;
    const currentAudioTime = this._audioService.currentTime();
    
    // Si on est avant le début des points de synchro, on ne fait rien
    if (currentAudioTime < startTime) return;

    // On lance la lecture de Flat si on peut, mais on ne bloque rien
    this._isPlaying.set(true);
    this.embed.play().catch(() => {
        // Flat n'est peut-être pas encore prêt, ce n'est pas grave
    });
  }

  onAudioPause(): void {
    if (this.embed) {
      this._isPlaying.set(false);
      this.embed.pause().catch(() => {});
    }
  }

  async initEmbed(container: HTMLElement, customOptions: any = {}): Promise<void> {
    if (this.embed) {
      this.destroyEmbed();
    }

    const layout = 'track';
    
    this.embed = new Embed(container, {
      layout: layout,
      embedParams: {
        appId: environment.FLAT_APP_ID || '5ee76cf4fcef2d5e274f0f2a',
        layout: layout,
        respectSystemBreaks: false,
        controlsDisplay: false,
        embedMode: 'view',
        scrolling: true,
        displayLayoutIcons: false,
        themeSlider: '#afc638',
        themeCursorV0: '#afc638',
        themeCursorV1: '#afc638',
        autoplay: false,
        displayFirstLinePartsNames: false,
        displayOtherLinesPartsNames: false,
        branding: false,
        themeControlsBackground: '#afc638',
        themeIconsPrimary: '#afc638',
        themeSelection: 'transparent',
        systemBorders: 'none',
        zoom: 1,
        hideminimalheader: true,
        hideTempo: true,
        allowNotationEdit: false,
        ...customOptions?.embedParams
      },
      ...customOptions
    });

    this.setupEventListeners();
  }

  async loadMusicXML(xml: string): Promise<void> {
    if (!this.embed) return;
    try {
      await this.embed.loadMusicXML(xml);
      this._isReady.set(true);

      const uuids = await this.embed.call('getMeasuresUuids');
      this.measuresUuids.set(uuids);
      this.nbMeasures.set(uuids.length - 1);

      const details = await this.embed.call('getMeasureDetails');
      this.measureDetails.set(details);
      
      this.calculateMeasurePoints();
    } catch (error) {
      // Silent error
    }
  }

  async setPlaybackSpeed(speed: number): Promise<void> {
    if (!this.embed) return;
    try {
      await this.embed.call('setPlaybackSpeed', { speed });
    } catch (error) {}
  }

  calculateMeasurePoints(): void {
    const points: number[] = [];
    const syncPts = this.syncPoints();
    const nbMeasures = this.nbMeasures();

    if (syncPts.length < 2 || nbMeasures === 0) return;

    const endTime = syncPts[syncPts.length - 1].time;

    for (let i = 0; i < syncPts.length - 1; i++) {
      const syncPoint = syncPts[i];
      const nextSyncPoint = syncPts[i + 1];
      const currentStart = syncPoint.time;

      let nbMeasureToInsert: number;
      let timeOfMeasure: number;

      if (nextSyncPoint.type === 'end') {
        nbMeasureToInsert = nbMeasures - (syncPoint.location?.measureIdx ?? 0);
        timeOfMeasure = (endTime - syncPoint.time) / nbMeasureToInsert;
      } else {
        nbMeasureToInsert = (nextSyncPoint.location?.measureIdx ?? 0) - (syncPoint.location?.measureIdx ?? 0);
        timeOfMeasure = (nextSyncPoint.time - syncPoint.time) / nbMeasureToInsert;
      }

      for (let index = 0; index < nbMeasureToInsert; index++) {
        points.push(timeOfMeasure * index + currentStart);
      }
    }
    this.measurePoints.set(points);
  }

  async play(): Promise<void> {
    if (!this.embed) return;
    this._isPlaying.set(true);
    await this.embed.play();
  }

  async pause(): Promise<void> {
    if (!this.embed) return;
    this._isPlaying.set(false);
    await this.embed.pause();
  }

  async stop(): Promise<void> {
    if (!this.embed) return;
    this._isPlaying.set(false);
    await this.embed.stop();
  }

  async forcePlay(): Promise<void> {
    await this.play();
  }

  onPlay(cb: () => void) { this.playCallbacks.add(cb); return () => this.playCallbacks.delete(cb); }
  onPause(cb: () => void) { this.pauseCallbacks.add(cb); return () => this.pauseCallbacks.delete(cb); }
  onStop(cb: () => void) { this.stopCallbacks.add(cb); return () => this.stopCallbacks.delete(cb); }
  
  onCursorPosition(callback: (p: any) => void) { this.cursorPositionCallbacks.add(callback); return () => this.cursorPositionCallbacks.delete(callback); }
  onRangeSelection(callback: (s: any | null) => void) { this.rangeSelectionCallbacks.add(callback); return () => this.rangeSelectionCallbacks.delete(callback); }

  public setupEventListeners(): void {
    if (!this.embed) return;

    this.embed.on('play', () => { this._isPlaying.set(true); this.playCallbacks.forEach(cb => cb()); });
    this.embed.on('pause', () => { this._isPlaying.set(false); this.pauseCallbacks.forEach(cb => cb()); });
    this.embed.on('stop', () => { this._isPlaying.set(false); this.stopCallbacks.forEach(cb => cb()); });
    this.embed.on('ready', () => { this._isReady.set(true); });

    this.embed.on('cursorPosition', (async (position: any) => {
      if (this.loopMode()) return;
      const time = await this.findTimeByMeasure(position);
      if (time !== null) {
        untracked(() => {
          if (this._isPlaying()) this._audioService.pause();
          this._audioService.seek(time);
        });
      }
      this.cursorPositionCallbacks.forEach(cb => cb(position));
    }) as any);

    this.embed.on('rangeSelection', (async (selection: any) => {
      if (!selection) {
        this.loopMode.set(false);
        this.loopStart.set(null);
        this.loopEnd.set(null);
        this._audioService.setLoopRange(null, null);
        this.rangeSelectionCallbacks.forEach(cb => cb(null));
        return;
      }
      this.loopMode.set(true);
      const startTime = await this.findTimeByMeasure(selection.left, false);
      const endTime = await this.findTimeByMeasure(selection.right, true);
      if (startTime !== null && endTime !== null) {
        this.loopStart.set(startTime);
        this.loopEnd.set(endTime);
        this._audioService.setLoopRange(startTime, endTime);
        this._audioService.seek(startTime);
        this.rangeSelectionCallbacks.forEach(cb => cb(selection));
      }
    }) as any);
  }

  async findTimeByMeasure(position: any, isEnd = false): Promise<number | null> {
    const { measureUuid } = position;
    const measureIndex = this.measuresUuids().findIndex(e => e === measureUuid);
    if (measureIndex === -1 || this.measurePoints().length === 0) return null;
    return this.measurePoints()[measureIndex];
  }

  async getNbMeasures(): Promise<number> {
    if (!this.embed) return 0;
    return await this.embed.call('getNbMeasures');
  }

  async getMeasureDetails(): Promise<any> {
    if (!this.embed) return null;
    return await this.embed.call('getMeasureDetails');
  }

  async getParts(): Promise<any[]> {
    if (!this.embed) return [];
    return await this.embed.call('getParts');
  }

  async setMetronomeMode(mode: number): Promise<void> {
    if (!this.embed) return;
    await this.embed.call('setMetronomeMode', mode);
  }

  async setMasterVolume(volume: number): Promise<void> {
    if (!this.embed) return;
    await this.embed.call('setMasterVolume', { volume });
  }

  async setPartVolume(partUuid: string, volume: number): Promise<void> {
    if (!this.embed) return;
    await this.embed.call('setPartVolume', { partUuid, volume });
  }

  async seekTrackTo(time: number): Promise<void> {
    if (!this.embed) return;
    await this.embed.call('seekTrackTo', { time }).catch(() => {});
  }

  async reinitializeTrackWithSpeed(speed: number): Promise<void> {
    this._audioService.setPlaybackRate(speed);
    await this.setupTrack();
    await this.embed.call('setPlaybackSpeed', { speed });
  }

  private async setupTrack(): Promise<void> {
    if (!this.embed) {
      console.warn('[FlatService] setupTrack cancelled: embed not initialized');
      return;
    }
    const sync = this.syncPoints();
    if (!sync || sync.length === 0) {
      console.warn('[FlatService] setupTrack cancelled: no sync points available');
      return;
    }

    console.log(`[FlatService] Initializing external track with ${sync.length} points...`);
    
    try {
      await this.embed.stop();
      await this.embed.call('setTrack', {
        id: this.TRACK_ID,
        type: 'external',
        totalTime: this.totalTime(),
        synchronizationPoints: sync,
      });
      await this.embed.call('useTrack', { id: this.TRACK_ID });
      await this.embed.call('setMasterVolume', { volume: 0 });
      
      this._isTrackReady.set(true);
      console.log('%c[FlatService] External track successfully initialized!', 'color: #4CAF50; font-weight: bold');
    } catch (err) {
      console.error('[FlatService] Error during setupTrack:', err);
    }
  }

  destroyEmbed(): void {
    if (this.embed) {
      this.embed = undefined;
      this._isReady.set(false);
      this._isPlaying.set(false);
    }
  }
}
