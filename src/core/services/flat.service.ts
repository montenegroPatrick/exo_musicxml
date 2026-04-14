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
    return this._coreDataStore.syncPoints();
  });
  
  readonly totalTime = computed(() => {
    return this._coreDataStore.totalTime();
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

  // -- Interaction Requests (Agnostic) --
  readonly seekRequest = this._coreDataStore.seekRequest;
  readonly loopRangeRequest = this._coreDataStore.loopRangeRequest;

  // Speed management
  private readonly _currentSpeed = signal<number>(1);
  readonly currentSpeed = this._currentSpeed.asReadonly();

  constructor() {
    // 2. Playback Speed Sync
    effect(() => {
      // NOTE: Le playback rate est géré dynamiquement par les services de synchro
    });

    // 3. Reactive Track Initialization
    effect(() => {
      const sync = this.syncPoints();
      const ready = this.isReady();
      if (ready && sync.length > 0 && this.embed) {
        untracked(() => this.setupTrack());
      }
    });

    // 4. Reactive Measure Points Calculation
    effect(() => {
      const nb = this.nbMeasures();
      const sync = this.syncPoints();
      if (nb > 0 && sync.length >= 2) {
        untracked(() => this.calculateMeasurePoints());
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


  async initEmbed(container: HTMLElement, customOptions: any = {}): Promise<void> {
    if (this.embed) {
      this.destroyEmbed();
    }

    const layout = 'responsive';
    
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
      let xmlContent = xml.trim();
      
      // 1. Si c'est une URL, on fetch le contenu texte (Logique originale)
      if (xmlContent.startsWith('http')) {
        console.log('[FlatService] Fetching MusicXML from URL:', xmlContent);
        const response = await fetch(xmlContent);
        if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`);
        xmlContent = await response.text();
      }

      // 2. On s'assure que Flat est prêt pour l'injection
      if (!this._isReady()) {
        console.log('[FlatService] Waiting for Flat ready before injection...');
        await new Promise<void>((resolve) => {
          this.embed.on('ready', () => resolve());
          // Timeout de sécurité
          setTimeout(() => resolve(), 500);
        });
      }

      await this.embed.loadMusicXML(xmlContent);
      this._isReady.set(true);

      // 3. Récupération robuste des mesures (Attente si nécessaire)
      let uuids: string[] = [];
      let retries = 0;
      while (uuids.length === 0 && retries < 10) {
        uuids = await this.embed.call('getMeasuresUuids');
        if (uuids.length === 0) {
          console.log(`[FlatService] Waiting for measures (Retry ${retries + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 200));
          retries++;
        }
      }

      this.measuresUuids.set(uuids);
      this.nbMeasures.set(uuids.length);

      console.log('%c[FlatService] EXTRACTED UUIDS COUNT:', 'color: #FFEB3B', uuids.length);

      const details = await this.embed.call('getMeasureDetails');
      console.log('%c[FlatService] MEASURE DETAILS DUMP:', 'background: #9C27B0; color: white', details?.[0], '... total:', details?.length);
      this.measureDetails.set(details);
    } catch (error) {
      console.error('[FlatService] Error loading MusicXML:', error);
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

    console.log('%c[FlatService] NB MEASURES:', 'background: #FFEB3B; color: black; padding: 2px 5px; font-weight: bold', nbMeasures);
    console.log('%c[FlatService] SYNC POINTS COUNT:', 'background: #FFEB3B; color: black; padding: 2px 5px', syncPts.length);

    if (syncPts.length < 2 || nbMeasures === 0) {
      console.warn('[FlatService] Cannot calculate measure points: missing data', { syncPts, nbMeasures });
      return;
    }

    const endTime = syncPts[syncPts.length - 1].time;

    for (let i = 0; i < syncPts.length - 1; i++) {
      const syncPoint = syncPts[i];
      const nextSyncPoint = syncPts[i + 1];
      const currentStart = syncPoint.time;

      let nbMeasureToInsert: number;
      let timeOfMeasure: number;

      if (nextSyncPoint.type === 'end') {
        nbMeasureToInsert = nbMeasures - (syncPoint.location?.measureIdx ?? 0);
        timeOfMeasure = (endTime - syncPoint.time) / (nbMeasureToInsert || 1);
      } else {
        nbMeasureToInsert = (nextSyncPoint.location?.measureIdx ?? 0) - (syncPoint.location?.measureIdx ?? 0);
        timeOfMeasure = (nextSyncPoint.time - syncPoint.time) / (nbMeasureToInsert || 1);
      }

      for (let index = 0; index < nbMeasureToInsert; index++) {
        points.push(timeOfMeasure * index + currentStart);
      }
    }

    // -- Extrapolation Final Phase --
    // If we have more measures in the score than in the sync points, 
    // we extrapolate using the remaining time till the end of the video.
    const lastSyncPoint = syncPts[syncPts.length - 1];
    if (points.length < nbMeasures && lastSyncPoint) {
        let durationPerMeasure = 2; // Default fallback
        const prevSyncPoint = syncPts.length >= 2 ? syncPts[syncPts.length - 2] : null;

        if (prevSyncPoint) {
            const segDuration = lastSyncPoint.time - prevSyncPoint.time;
            const segMeasures = (lastSyncPoint.location?.measureIdx ?? 0) - (prevSyncPoint.location?.measureIdx ?? 0);
            if (segMeasures > 0) durationPerMeasure = segDuration / segMeasures;
        }

        const remainingMeasures = nbMeasures - (lastSyncPoint.location?.measureIdx ?? 0);
        const totalDuration = this.totalTime();
        const remainingTime = totalDuration - lastSyncPoint.time;

        // Si on a encore du temps réel devant nous, on affine
        if (remainingTime > 0.1 && remainingMeasures > 0) {
            durationPerMeasure = remainingTime / remainingMeasures;
            console.log(`[FlatService] Smart Extrapolation: ${remainingMeasures} measures over ${remainingTime.toFixed(2)}s (${durationPerMeasure.toFixed(2)}s/m)`);
        } else {
            console.log(`[FlatService] Constant Tempo Extrapolation: ${durationPerMeasure.toFixed(2)}s/m`);
        }

        const currentPointsCount = points.length;
        const startMeasureIdx = lastSyncPoint.location?.measureIdx ?? 0;
        const totalToPush = nbMeasures - currentPointsCount;
        
        for (let i = 0; i < totalToPush; i++) {
            const absoluteMeasureIdx = currentPointsCount + i;
            const offsetFromLastSync = absoluteMeasureIdx - startMeasureIdx;
            const calculatedTime = lastSyncPoint.time + (offsetFromLastSync * durationPerMeasure);
            
            // On plafonne seulement si on a une vraie durée totale supérieure au dernier point
            if (totalDuration > lastSyncPoint.time) {
                points.push(Math.min(calculatedTime, totalDuration));
            } else {
                points.push(calculatedTime);
            }
        }
    }

    this.measurePoints.set(points);
    console.log(`[FlatService] Final measurePoints count: ${points.length} (nbMeasures: ${nbMeasures})`);
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
      console.log('%c[FlatService] CURSOR POSITION EVENT:', 'background: #FF5722; color: white; padding: 2px 5px', position);
      
      if (this.loopMode()) {
        console.log('[FlatService] Seek ignored because LoopMode is active');
        return;
      }

      const time = await this.findTimeByMeasure(position);
      console.log(`[FlatService] Measure to Time mapping: ${time}s`);

      if (time !== null) {
        console.log(`[FlatService] DISPATCHING SEEK REQUEST to CoreData: ${time}s`);
        this._coreDataStore.requestSeek(time);
      } else {
        console.warn('[FlatService] Could not map measure to time. measurePoints length:', this.measurePoints().length);
      }
      this.cursorPositionCallbacks.forEach(cb => cb(position));
    }) as any);

    this.embed.on('rangeSelection', (async (selection: any) => {
      if (!selection) {
        this.loopMode.set(false);
        this.loopStart.set(null);
        this.loopEnd.set(null);
        this._coreDataStore.requestLoopRange(null, null);
        this.rangeSelectionCallbacks.forEach(cb => cb(null));
        return;
      }

      // 3. Application logique du temps
      this.loopMode.set(true);
      const startTime = await this.findTimeByMeasure(selection.left, false);
      const endTime = await this.findTimeByMeasure(selection.right, true);
      
      if (startTime !== null && endTime !== null) {
        console.log(`[FlatService] Range selection detected. Requesting Loop: [${startTime}s - ${endTime}s]`);
        this.loopStart.set(startTime);
        this.loopEnd.set(endTime);
        this._coreDataStore.requestLoopRange(startTime, endTime);
        this.rangeSelectionCallbacks.forEach(cb => cb(selection));
      }
    }) as any);
  }

  async findTimeByMeasure(position: any, isEnd = false): Promise<number | null> {
    const { measureUuid } = position;
    const uuids = this.measuresUuids();
    const points = this.measurePoints();
    
    const measureIndex = uuids.findIndex(e => e === measureUuid);
    
    if (measureIndex === -1 || points.length === 0) {
      console.warn('[FlatService] findTimeByMeasure failed:', { measureIndex, pointsLength: points.length });
      return null;
    }
    
    if (isEnd) {
      // Pour une fin de sélection, on veut inclure la mesure complète
      // On prend donc le point de départ de la mesure suivante.
      const targetIndex = measureIndex + 1;
      if (targetIndex < points.length) {
        return points[targetIndex];
      } else {
        // C'est la toute dernière mesure de la partition
        return this.totalTime();
      }
    }
    
    return points[measureIndex] ?? null;
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
    this._currentSpeed.set(speed);
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
