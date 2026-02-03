import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import Embed from 'flat-embed';
import {
  EmbedOptions,
  MeasureDetails,
  Part,
} from '@core/interfaces/playback.interface';
import { Sync } from '@core/interfaces/lesson.interface';
import { LessonService } from '@app/modules/lesson/services/lesson.service';
import { NoteCursorPosition } from 'node_modules/flat-embed/dist/types/cursorPosition';
import { NoteDetails } from 'node_modules/flat-embed/dist/types/note';

export interface RangeSelection {
  left: NoteCursorPosition;
  right: NoteCursorPosition;
}

export interface LoopBounds {
  start: number | null;
  end: number | null;
}

@Injectable({ providedIn: 'root' })
export class FlatService {
  private _lessonService = inject(LessonService);
  private embed: Embed | undefined;

  // Event callbacks
  private playCallbacks: Set<() => void> = new Set();
  private pauseCallbacks: Set<() => void> = new Set();
  private stopCallbacks: Set<() => void> = new Set();
  private cursorPositionCallbacks: Set<(position: NoteCursorPosition) => void> =
    new Set();
  private rangeSelectionCallbacks: Set<
    (selection: RangeSelection | null) => void
  > = new Set();

  // Reactive signals
  private readonly _isReady = signal<boolean>(false);
  private readonly _currentMeasureIdx = signal<number>(0);
  private readonly _isPlaying = signal<boolean>(false);
  private readonly _isInitialized = signal<boolean>(false);

  // Public readonly signals
  readonly isReady = this._isReady.asReadonly();
  readonly currentMeasureIdx = this._currentMeasureIdx.asReadonly();
  readonly isPlaying = this._isPlaying.asReadonly();

  readonly lessonJson = computed(() => this._lessonService.lessonJson());
  readonly imgType = computed(() => this._lessonService.imgType());
  readonly originalSyncPoints = computed(() =>
    this._lessonService.syncPoints(),
  );
  syncPoints = signal<Sync[]>([]);
  totalTime = signal<number>(0);

  // Measure tracking
  readonly measuresUuids = signal<string[]>([]);
  readonly nbMeasures = signal<number>(0);
  readonly measurePoints = signal<number[]>([]);
  readonly measureDetails = signal<MeasureDetails | null>(null);

  // Notes cache per measure
  private measureNotesCache: Map<string, NoteDetails[]> = new Map();

  // Loop management
  readonly loopMode = signal<boolean>(false);
  readonly loopStart = signal<number | null>(null);
  readonly loopEnd = signal<number | null>(null);

  // Speed management
  private readonly _currentSpeed = signal<number>(1);
  readonly currentSpeed = this._currentSpeed.asReadonly();
  /**
   * Initialize the Flat.io embed in a container
   */
  async initEmbed(
    container: HTMLElement,
    options: EmbedOptions = {},
  ): Promise<void> {
    // Destroy previous instance if exists
    if (this.embed) {
      this.destroyEmbed();
    }

    const width = window.innerWidth;

    this.embed = new Embed(container, {
      embedParams: {
        appId: environment.FLAT_APP_ID,
        controlsDisplay: false,
        playbackMetronome: 'inactive',
        themeControlsBackground: '#afc638',
        themeSelection: 'transparent',
        controlsPlay: false,
        branding: false,
        playbackVolumeMaster: 0,
        noAudio: true,
        layout: 'responsive',
        zoom: width > 800 ? 'auto' : 1,
        displayFirstLinePartsNames: false,
        hideTempo: true,
        controlsPrint: true,
      },
    });
    console.log('[FlatService]:initEmbed => init', this.imgType());
    if (this.imgType() !== 'xml') return;
    console.log('[FlatService]:initEmbed => init xml', this.imgType());
    this.initSyncPoints();
  }
  initSyncPoints() {
    const syncPts = this.originalSyncPoints();
    if (!syncPts || syncPts.length === 0) return;
    this.syncPoints.set(syncPts);
    this.totalTime.set(syncPts[syncPts.length - 1].time);
  }
  async setTrack(): Promise<void> {
    console.log('[FlatService]:setTrack => init', this.syncPoints());
    await this.embed?.setTrack({
      id: 'external-1',
      type: 'external',
      synchronizationPoints: this.syncPoints(),
      totalTime: this.totalTime(),
    });
    console.log('[FlatService]:setTrack => finish', this.syncPoints());
  }
  async useTrack(): Promise<void> {
    console.log('[FlatService]:useTrack => init');
    await this.embed?.useTrack({
      id: 'external-1',
    });
    console.log('[FlatService]:useTrack => finish');
  }
  /**
   * Load MusicXML content into the embed
   */
  async loadMusicXML(xml: string): Promise<void> {
    if (!this.embed) {
      throw new Error('Embed not initialized. Call initEmbed first.');
    }

    await this.embed.loadMusicXML(xml).then(() => {
      this._isReady.set(true);
    });
  }

  /**
   * Destroy the embed instance
   */
  destroyEmbed(): void {
    if (this.embed) {
      this.embed = undefined;
      this._isReady.set(false);
      this._isPlaying.set(false);
      this._isInitialized.set(false);
      this._currentMeasureIdx.set(0);
      this._currentSpeed.set(1);

      // Clear callbacks
      this.playCallbacks.clear();
      this.pauseCallbacks.clear();
      this.stopCallbacks.clear();
      this.cursorPositionCallbacks.clear();
      this.rangeSelectionCallbacks.clear();

      // Clear measure data
      this.measuresUuids.set([]);
      this.nbMeasures.set(0);
      this.measurePoints.set([]);
      this.measureDetails.set(null);
      this.measureNotesCache.clear();

      // Clear loop data
      this.loopStart.set(null);
      this.loopEnd.set(null);
    }
  }

  // Navigation
  async goToMeasure(measureIdx: number): Promise<void> {
    await (this.embed as any)?.goToMeasure?.(measureIdx);
    this._currentMeasureIdx.set(measureIdx);
  }

  // Playback controls
  async play(): Promise<void> {
    if (this.isPlaying()) {
      await this.embed?.pause();
    }
    await this.embed?.play();
  }

  async pause(): Promise<void> {
    await this.embed?.pause();
  }

  async stop(): Promise<void> {
    await this.embed?.stop();
  }

  // Configuration
  async setPlaybackSpeed(speed: number): Promise<void> {
    await this.embed?.setPlaybackSpeed(speed);
  }

  async setMasterVolume(volume: number): Promise<void> {
    await this.embed?.setMasterVolume({ volume });
  }

  async setPartVolume(partUuid: string, volume: number): Promise<void> {
    await this.embed?.setPartVolume({ partUuid, volume });
  }

  async getPartVolume(partUuid: string): Promise<number | undefined> {
    return await this.embed?.getPartVolume({ partUuid });
  }

  async setMetronomeMode(mode: 0 | 1 | 2): Promise<void> {
    await this.embed?.setMetronomeMode(mode);
  }
  async seekTrackTo(time: number) {
    if (!this._isPlaying()) {
      await this.play();
    }
    await this.embed?.seekTrackTo({ time }).catch((error) => {
      console.error('[FlatService]:seekTrackTo => catch error', error);
    });

    this.pause();
  }

  // Score information
  async getNbMeasures(): Promise<number | undefined> {
    return await this.embed?.getNbMeasures();
  }

  async getMeasureDetails(): Promise<MeasureDetails | undefined> {
    return await this.embed?.getMeasureDetails();
  }

  async getParts(): Promise<Part[] | undefined> {
    return await this.embed?.getParts();
  }

  // Event subscriptions
  onPlay(callback: () => void): () => void {
    this.playCallbacks.add(callback);
    return () => this.playCallbacks.delete(callback);
  }

  onPause(callback: () => void): () => void {
    this.pauseCallbacks.add(callback);
    return () => this.pauseCallbacks.delete(callback);
  }

  onStop(callback: () => void): () => void {
    this.stopCallbacks.add(callback);
    return () => this.stopCallbacks.delete(callback);
  }
  onCursorPosition(
    callback: (position: NoteCursorPosition) => void,
  ): () => void {
    this.cursorPositionCallbacks.add(callback);
    return () => this.cursorPositionCallbacks.delete(callback);
  }

  onRangeSelection(
    callback: (selection: RangeSelection | null) => void,
  ): () => void {
    this.rangeSelectionCallbacks.add(callback);
    return () => this.rangeSelectionCallbacks.delete(callback);
  }

  /**
   * Register a raw embed event listener
   */
  on(event: string, callback: (...args: any[]) => void): void {
    this.embed?.on(event as any, callback);
  }

  /**
   * Get the raw embed instance (for advanced use cases)
   */
  getEmbed(): Embed | undefined {
    return this.embed;
  }

  // Private methods

  setupEventListeners(): void {
    if (!this.embed) return;

    this.embed.on('play', () => {
      if (this._isPlaying()) return;
      if (!this.isReady()) return;
      if (this.loopMode()) {
        this.embed?.seekTrackTo({ time: this.loopStart()! });
      }
      this._isPlaying.set(true);
      this.playCallbacks.forEach((cb) => cb());
    });

    this.embed.on('pause', () => {
      if (!this._isPlaying()) return;
      this._isPlaying.set(false);
      this.pauseCallbacks.forEach((cb) => cb());
    });

    this.embed.on('stop', () => {
      this._isPlaying.set(false);
      this.stopCallbacks.forEach((cb) => cb());
    });

    this.embed.on('ready', () => {
      this._isReady.set(true);
    });

    this.embed.on('cursorPosition', (async (position: NoteCursorPosition) => {
      if (!this._isInitialized()) {
        this._isInitialized.set(true);
        return;
      }

      if (this.loopMode()) {
        this.loopMode.set(false);
      }

      this.embed?.pause();
      this.cursorPositionCallbacks.forEach((cb) => cb(position));
    }) as any);

    this.embed.on('rangeSelection', (async (
      selection: RangeSelection | undefined,
    ) => {
      if (!selection) {
        this.loopMode.set(false);
        this.loopStart.set(null);
        this.loopEnd.set(null);
        this.rangeSelectionCallbacks.forEach((cb) => cb(null));
        return;
      }

      this.loopMode.set(true);
      const startTime = await this.findTimeByMeasure(selection.left, false);
      const endTime = await this.findTimeByMeasure(selection.right, true);

      this.loopStart.set(startTime!);
      this.loopEnd.set(endTime!);
      this.rangeSelectionCallbacks.forEach((cb) => cb(selection));
      if (this.isPlaying()) {
        this.embed?.pause();
      }
    }) as any);
  }

  /**
   * Initialize measure data after XML is loaded
   */
  async initializeMeasureData(): Promise<void> {
    if (!this.embed) return;

    try {
      const uuids = await this.embed.getMeasuresUuids();
      this.measuresUuids.set(uuids);
      this.nbMeasures.set(uuids.length - 1);

      const details = await this.embed.getMeasureDetails();
      this.measureDetails.set(details);

      this.calculateMeasurePoints();
      console.log('[FlatService]:initializeMeasureData => completed', {
        nbMeasures: this.nbMeasures(),
        measurePoints: this.measurePoints().length,
      });
    } catch (error) {
      console.error('[FlatService]:initializeMeasureData => error', error);
    }
  }

  /**
   * Calculate time points for each measure based on synchronization points
   */
  calculateMeasurePoints(): void {
    const points: number[] = [];
    const syncPts = this.syncPoints();

    if (syncPts.length < 2) {
      this.measurePoints.set(points);
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
        // Last segment: from current sync point to end
        nbMeasureToInsert = this.nbMeasures() - syncPoint.location.measureIdx;
        timeOfMeasure = (endTime - syncPoint.time) / nbMeasureToInsert;
      } else {
        // Segment between two sync points
        nbMeasureToInsert =
          nextSyncPoint.location.measureIdx - syncPoint.location.measureIdx;
        timeOfMeasure =
          (nextSyncPoint.time - syncPoint.time) / nbMeasureToInsert;
      }

      for (let index = 0; index < nbMeasureToInsert; index++) {
        points.push(timeOfMeasure * index + currentStart);
      }
    }

    this.measurePoints.set(points);
    console.log(
      '[FlatService]:calculateMeasurePoints =>',
      points.length,
      'points',
    );
  }

  /**
   * Find the exact time for a given cursor position
   * @param position - Cursor position with measureUuid, noteIdx, voiceUuid, partUuid
   * @param isEnd - If true, returns end time of the note/measure
   */
  async findTimeByMeasure(
    position: NoteCursorPosition,
    isEnd: boolean = false,
  ): Promise<number | null> {
    const { measureUuid, noteIdx, voiceUuid, partUuid } = position;
    const measureIndex = this.measuresUuids().findIndex(
      (e) => e === measureUuid,
    );

    if (measureIndex === -1) {
      console.warn('[FlatService]:findTimeByMeasure => measure not found');
      return null;
    }

    const mPoints = this.measurePoints();
    if (mPoints.length === 0) {
      return null;
    }

    // Get notes for this measure (with caching)
    const notes = await this.getNotesForMeasure(
      measureUuid,
      voiceUuid,
      partUuid,
    );

    if (notes.length > 0) {
      if (noteIdx === 0 && !isEnd) {
        return mPoints[measureIndex];
      }

      const startOfMeasure = mPoints[measureIndex];
      const endOfMeasure =
        measureIndex < mPoints.length - 1
          ? mPoints[measureIndex + 1]
          : mPoints[measureIndex];

      const subdivisionsPerMeasure = notes.length;
      const timeOfOneNote =
        (endOfMeasure - startOfMeasure) / subdivisionsPerMeasure;

      const targetNoteIdx = isEnd ? noteIdx + 1 : noteIdx;
      const timeOfNote = targetNoteIdx * timeOfOneNote;

      return startOfMeasure + timeOfNote;
    }

    // Fallback: return measure start time
    return mPoints[measureIndex];
  }

  /**
   * Get notes for a measure with caching
   */
  private async getNotesForMeasure(
    measureUuid: string,
    voiceUuid: string,
    partUuid: string,
  ): Promise<NoteDetails[]> {
    const cacheKey = `${measureUuid}-${voiceUuid}-${partUuid}`;

    if (this.measureNotesCache.has(cacheKey)) {
      return this.measureNotesCache.get(cacheKey)!;
    }

    const notes: NoteDetails[] = [];
    let index = 0;
    const maxAttempts = 50;

    while (index < maxAttempts) {
      try {
        const noteData = await this.embed?.getNoteData({
          measureUuid,
          noteIdx: index,
          voiceUuid,
          partUuid,
        });

        if (!noteData) break;

        notes.push(noteData);
        index++;
      } catch {
        break;
      }
    }

    this.measureNotesCache.set(cacheKey, notes);
    return notes;
  }

  /**
   * Reinitialize track with a new playback speed
   * @param speed - Speed factor (1 = normal, 1.5 = 150%, 0.5 = 50%)
   */
  async reinitializeTrackWithSpeed(speed: number): Promise<void> {
    if (!this.embed) {
      throw new Error('Embed not initialized');
    }

    const originalSync = this.originalSyncPoints();
    if (!originalSync || originalSync.length === 0) {
      throw new Error('No original sync points available');
    }

    await this.embed.stop();

    // Calculate new parameters based on speed
    const originalTotal = originalSync[originalSync.length - 1].time;
    const newTotalTime = originalTotal / speed;
    const newSyncPoints: Sync[] = originalSync.map((point) => ({
      ...point,
      time: point.time / speed,
    }));

    console.log('[FlatService]:reinitializeTrackWithSpeed =>', {
      speed,
      originalTotal,
      newTotalTime,
    });

    // Update signals
    this.syncPoints.set(newSyncPoints);
    this.totalTime.set(newTotalTime);
    this._currentSpeed.set(speed);

    // Reconfigure track
    const trackId = `external-speed-${speed}`;
    await this.embed.setTrack({
      id: trackId,
      type: 'external',
      totalTime: newTotalTime,
      synchronizationPoints: newSyncPoints,
    });

    await this.embed.useTrack({ id: trackId });
    await this.embed.setPlaybackSpeed(speed);

    // Recalculate measure points
    this.calculateMeasurePoints();

    console.log('[FlatService]:reinitializeTrackWithSpeed => completed');
  }

  /**
   * Handle range selection for loop creation
   */
  async handleRangeSelection(selection: RangeSelection): Promise<LoopBounds> {
    const loopStart = await this.findTimeByMeasure(selection.left, false);
    const loopEnd = await this.findTimeByMeasure(selection.right, true);

    if (loopStart === null || loopEnd === null || loopStart === loopEnd) {
      return { start: null, end: null };
    }

    // Ensure start < end
    const bounds: LoopBounds =
      loopStart > loopEnd
        ? { start: loopEnd, end: loopStart }
        : { start: loopStart, end: loopEnd };

    this.loopStart.set(bounds.start);
    this.loopEnd.set(bounds.end);

    return bounds;
  }

  /**
   * Clear loop bounds
   */
  clearLoop(): void {
    this.loopStart.set(null);
    this.loopEnd.set(null);
  }

  /**
   * Toggle loop mode
   */
  toggleLoopMode(): boolean {
    const newMode = !this.loopMode();
    this.loopMode.set(newMode);
    return newMode;
  }

  /**
   * Clear notes cache (useful when loading new XML)
   */
  clearNotesCache(): void {
    this.measureNotesCache.clear();
  }

  /**
   * Get current loop bounds
   */
  getLoopBounds(): LoopBounds {
    return {
      start: this.loopStart(),
      end: this.loopEnd(),
    };
  }
}
