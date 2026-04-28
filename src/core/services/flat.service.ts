import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { environment } from '@environments/environment';
import Embed from 'flat-embed';
import {
  MeasureDetails,
} from '@core/interfaces/playback.interface';
import { LessonService } from '@app/modules/lesson/services/lesson.service';
import { CoreDataService } from './core-data.service';
import { DiapoStateService } from '@core/shared/diapo/services/diapo.service';
import { ITimeListener } from './audio.service';

export interface RangeSelection {
  left: any;
  right: any;
}

@Injectable({ providedIn: 'root' })
export class FlatService implements ITimeListener {
  private _lessonService = inject(LessonService);
  private _coreDataStore = inject(CoreDataService);
  private _diapoService = inject(DiapoStateService);
  private embed: any | undefined;
  private readonly TRACK_ID = 'external-1';
  private _lastSyncedTime = 0;

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
  private readonly _currentSpeed = signal<number>(1);
  private readonly _currentLayout = signal<'track' | 'responsive'>('track');
  private readonly _time = signal<number>(0);
  private _isSyncing = false;
  private _measureNotesCache: Record<string, any[]> = {};
  private readonly _duration = signal<number>(0);

  private readonly _currentBeat = signal<number>(-1);
  private readonly _timeInMeasure = signal<number>(4);

  // Public readonly signals
  readonly isReady = this._isReady.asReadonly();
  readonly isPlaying = this._isPlaying.asReadonly();
  readonly isTrackReady = this._isTrackReady.asReadonly();
  readonly currentSpeed = this._currentSpeed.asReadonly();
  readonly time = this._time.asReadonly();
  readonly duration = this._duration.asReadonly();
  readonly currentBeat = this._currentBeat.asReadonly();
  readonly timeInMeasure = this._timeInMeasure.asReadonly();

  readonly lessonJson = this._coreDataStore.lessonJson;
  readonly diapoType = computed(() => this._lessonService.diapoType());
  readonly syncPoints = computed(() => {
     const syncs = this._coreDataStore.syncPoints();
     if (syncs && syncs.length > 0) return syncs;
     const videoSyncs = this._coreDataStore.videoSyncPoints();
     return videoSyncs && videoSyncs.length > 0 ? videoSyncs : [];
  });
  
  readonly totalTime = computed(() => {
     const syncs = this.syncPoints();
     if (syncs && syncs.length > 0) {
         const end = syncs.find(s => (s as any).type === 'end');
         if (end) return (end as any).time;
     }
     return this._coreDataStore.totalTime();
  });
  readonly parts = signal<any[]>([]);
  readonly nbMeasures = signal<number>(0);
  readonly loopMode = signal<boolean>(false);
  readonly loopStart = signal<number | null>(null);
  readonly loopEnd = signal<number | null>(null);

  private _lastLoadedXml: string | null = null;

  constructor() {
    effect(() => {
      const xml = this._lessonService.xmlContent();
      if (xml && this.embed && xml !== this._lastLoadedXml) {
        untracked(() => this.loadMusicXML(xml));
      }
    });
  }

  async initEmbed(container: HTMLElement, customOptions: any = {}): Promise<void> {
    if (this.embed) this.destroyEmbed();
    let zoom = window.innerWidth < 768 ? 0.7 : 0.9;
    container.innerHTML = '';
    let layout = (this._diapoService.getFlatLayout() === 'track' || window.innerWidth < 768) ? 'track' : 'responsive';
    
    // Forcer le layout responsive sur la route score-musicxml
    if (this._coreDataStore.isMidiMode()) {
      layout = 'responsive';
    }

    this.embed = new Embed(container, {
      layout: layout,
      embedParams: {
        appId: environment.FLAT_APP_ID || '5ee76cf4fcef2d5e274f0f2a',
        layout: layout,
        controlsDisplay: false,
        embedMode: 'view',
        scrolling: true,
        displayLayoutIcons: false,
        autoplay: false,
        branding: false,
        themeControlsBackground: '#FA5E46',
        themeIconsPrimary: '#FA5E46',
        themeSelection: 'transparent',
        systemBorders: 'none',
        zoom: zoom,
        playbackMetronome: true,
        hideminimalheader: true,
        hideTempo: true,
        allowNotationEdit: false,
        displayFirstLinePartsNames: false,
        displayOtherLinesPartsNames: false,
        ...customOptions?.embedParams
      },
      ...customOptions
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.embed) return;
    this.embed.on('play', () => { this._isPlaying.set(true); this.playCallbacks.forEach(cb => cb()); });
    this.embed.on('pause', () => { this._isPlaying.set(false); this.pauseCallbacks.forEach(cb => cb()); });
    this.embed.on('stop', () => { this._isPlaying.set(false); this._currentBeat.set(-1); this.stopCallbacks.forEach(cb => cb()); });
    this.embed.on('ready', () => { 
      this._isReady.set(true); 
      // Initialize metronome volume to a default audible level
      this.setMetronomeVolume(80);
    });
    this.embed.on('playbackPositionUpdated', (ev: any) => { 
      const time = ev.seconds ?? ev.currentTime ?? 0;
      this._time.set(time); 
    });
    this.embed.on('playbackPosition', (ev: any) => { 
      const time = ev.seconds ?? ev.currentTime ?? 0;
      this._time.set(time); 
    });
    this.embed.on('cursorPosition', async (pos: any) => {
      console.log('[FlatService] cursorPosition event received:', pos, '_isSyncing:', this._isSyncing);
      if (pos && pos.beatIdx !== undefined) this._currentBeat.set(pos.beatIdx);
      this.cursorPositionCallbacks.forEach(cb => cb(pos));
      
      // Feature 1: Clic sur une note -> seek
      // On ignore l'événement s'il est déclenché par notre propre synchronisation
      if (!this._isSyncing && pos) {
         this._isSyncing = true;
         try {
             const time = await this.findTimeByMeasure(pos);
             console.log('[FlatService] Time resolved for cursorPosition:', time);
             if (time !== null) {
                 this._coreDataStore.requestSeek(time);
             }
         } catch (e) { console.error('[FlatService] cursorPosition error:', e); }
         setTimeout(() => { this._isSyncing = false; }, 500);
      }
    });

    let rangeSelectionTimeout: any;

    this.embed.on('rangeSelection', async (sel: any) => {
      this.rangeSelectionCallbacks.forEach(cb => cb(sel));
      
      // Feature 2: Sélection d'une partie -> set loop
      // Utilisation d'un debounce (trailing) pour ne pas spammer la vidéo pendant le glissement
      if (rangeSelectionTimeout) {
          clearTimeout(rangeSelectionTimeout);
      }

      rangeSelectionTimeout = setTimeout(async () => {
          if (sel && sel.left && sel.right) {
              try {
                 const embed = this.embed as any;
                 
                 let start = await this.findTimeByMeasure(sel.left);
                 let end = await this.findTimeByMeasure(sel.right, true);

                 if (start === null) start = 0;
                 
                 // If the user just clicked a single note, sel.left and sel.right are identical.
                 // This is effectively a "deselect range" or "simple seek" action, not a loop creation.
                 const isSingleNote = sel.left.measureUuid === sel.right.measureUuid && sel.left.noteIdx === sel.right.noteIdx;
                 
                 if (end === null || end === start || isSingleNote) {
                     this._coreDataStore.requestLoopRange(null, null);
                 } else if (start !== undefined && end !== undefined && end > start) {
                     this._coreDataStore.requestLoopRange(start, end);
                     // On déplace aussi la tête de lecture au début de la sélection
                     this._coreDataStore.requestSeek(start);
                 }
              } catch(e) { console.error('[FlatService] rangeSelection error:', e); }
          } else if (!sel) {
              // Désélection -> annuler la boucle
              this._coreDataStore.requestLoopRange(null, null);
          }
      }, 150); // 150ms debounce
    });
  }

  async clearSelection(): Promise<void> {
    if (!this.embed || !this._lastLoadedXml) return;
    try {
        console.log('[FlatService] clearSelection requested, stopping internal loop and re-initializing score...');
        this._isSyncing = true;
        const embed = this.embed as any;
        
        // 1. Force stop Flat's internal playback engine to break any active loop panic instantly
        await (embed.stop?.() || embed.call('stop'));
        
        // 2. Reload the XML to cleanly wipe the visual selection (using the service's method to keep track setup)
        await this.loadMusicXML(this._lastLoadedXml);
        
        setTimeout(() => { this._isSyncing = false; }, 1000);
    } catch(e) {
        console.error('[FlatService] clearSelection error:', e);
        this._isSyncing = false;
    }
  }

  async loadMusicXML(xml: string): Promise<void> {
    if (!this.embed) return;
    this._lastLoadedXml = xml;
    
    try {
      // Parse initial tempo and signature from XML
      const tempoMatch = xml.match(/<sound\s+[^>]*?tempo="(\d+)"/);
      if (tempoMatch) {
          console.log(`[FlatService] Detected tempo in XML: ${tempoMatch[1]} BPM`);
      }
      
      const signatureMatch = xml.match(/<beats>(\d+)<\/beats>/);
      if (signatureMatch) {
          const beats = parseInt(signatureMatch[1], 10);
          console.log(`[FlatService] Detected signature in XML: ${beats} beats`);
          this._timeInMeasure.set(beats);
      }

      await this.embed.loadMusicXML(xml);
      
      // Wait for the score to be processed and ready to answer metadata calls
      await new Promise(resolve => {
        const check = async () => {
            try {
                const uuids = await this.embed.call('getMeasuresUuids');
                if (uuids && uuids.length > 0) {
                    resolve(true);
                } else {
                    setTimeout(check, 100);
                }
            } catch {
                setTimeout(check, 100);
            }
        };
        check();
      });

      // 1. Fetch Score Metadata
      try {
        const embed = this.embed as any;
        const parts = await (embed.getParts?.() || embed.call('getParts')).catch(() => []);
        const measures = await (embed.getNbMeasures?.() || embed.call('getNbMeasures')).catch(() => 0);
        const measuresUuids = await (embed.getMeasuresUuids?.() || embed.call('getMeasuresUuids')).catch(() => []);
        const playbackDetails = await (embed.getPlaybackDetails?.() || embed.call('getPlaybackDetails')).catch(() => ({ playbackDuration: 0 }));

        this.parts.set(parts);
        this.nbMeasures.set(measures);
        const duration = playbackDetails?.playbackDuration || 0;
        if (duration) this._duration.set(duration);
        console.log(`[FlatService] UUIDS:`, measuresUuids, `Score metadata: ${measures} measures, ${duration}s duration`);
      } catch (e) {
        console.warn('[FlatService] Error fetching metadata:', e);
      }

      // 2. Fetch Measure Details for seek mapping
      const embed = this.embed as any;

      // Advanced duration calculation (Fallback if duration is still 0)
      if (this._duration() === 0) {
        let totalSeconds = 0;
        const currentBpm = await this.getTempo();
        
        // Try to calculate from XML structure
        const xml = this._lessonService.xmlContent();
        if (xml) {
            // Split by measure tags to handle each measure's time signature
            const measures = xml.match(/<measure[^>]*>([\s\S]*?)<\/measure>/g) || [];
            let currentBeats = 4;
            let currentBeatType = 4;
            
            measures.forEach(m => {
                const timeMatch = m.match(/<time[^>]*>[\s\S]*?<beats>(\d+)<\/beats>[\s\S]*?<beat-type>(\d+)<\/beat-type>[\s\S]*?<\/time>/);
                if (timeMatch) {
                    currentBeats = parseInt(timeMatch[1], 10);
                    currentBeatType = parseInt(timeMatch[2], 10);
                }
                // Formula: duration = (beats * 60) / (bpm * (beatType / 4))
                // For quarter-note based (4/4, 3/4, 2/4), it's beats * (60 / bpm)
                // For eighth-note based (6/8, 12/8), it's beats * (60 / bpm) * (4/8) = beats * (30 / bpm)
                const measureDuration = (currentBeats * 60) / (currentBpm * (currentBeatType / 4));
                totalSeconds += measureDuration;
            });
        }
        
        if (totalSeconds > 0) {
            console.log(`[FlatService] Calculated precise duration from XML: ${totalSeconds.toFixed(2)}s`);
            this._duration.set(totalSeconds);
        }
      }

      this._isReady.set(true);
      if (!this._coreDataStore.isMidiMode()) {
        await this.setupTrack();
      } else {
        this._isTrackReady.set(true);
      }
    } catch (error) { 
      console.error('[FlatService] loadMusicXML error:', error); 
    }
  }

  private async setupTrack(): Promise<void> {
    if (!this.embed) return;
    const sync = this.syncPoints();
    if (!sync || sync.length === 0) return;
    try {
      await this.embed.call('setTrack', { id: this.TRACK_ID, type: 'external', totalTime: this.totalTime(), synchronizationPoints: sync });
      await this.embed.call('useTrack', { id: this.TRACK_ID });
      await this.embed.call('setMasterVolume', { volume: 0 });
      this._isTrackReady.set(true);
    } catch (err) { console.error('[FlatService] setupTrack error:', err); }
  }

  // --- RESTORED COMPATIBILITY METHODS ---
  
  async play(): Promise<void> { if (this.embed) await this.embed.play(); }
  async pause(): Promise<void> { if (this.embed) await this.embed.pause(); }
  async stop(): Promise<void> { if (this.embed) await this.embed.stop(); }

  async seekTrackTo(time: number): Promise<void> {
    if (this.embed) await this.embed.call('seekTrackTo', { time });
  }

  async setPlaybackSpeed(speed: number): Promise<void> {
    if (!this.embed) return;
    this._currentSpeed.set(speed);
    await this.embed.call('setPlaybackSpeed', { speed });
  }

  async getPlaybackSpeed(): Promise<number> {
    if (!this.embed) return 1;
    return await this.embed.call('getPlaybackSpeed');
  }

  async reinitializeTrackWithSpeed(speed: number): Promise<void> {
    await this.setPlaybackSpeed(speed);
  }

  async syncWithAudio(audioTime: number, isPlaying: boolean): Promise<void> {
    if (!this.embed) return;
    this._isSyncing = true;
    try {
        if (isPlaying && !this._isPlaying()) await this.embed.play();
        else if (!isPlaying && this._isPlaying()) await this.embed.pause();
        await this.seekTrackTo(audioTime);
    } catch (e) {
        console.error('[FlatService] syncWithAudio error:', e);
    } finally {
        setTimeout(() => this._isSyncing = false, 500);
    }
  }

  private _measurePointsCache: number[] = [];

  private _getMeasurePoints(): number[] {
    const syncPoints = this.syncPoints() as any[];
    const nbMeasures = this.nbMeasures();
    
    if (!syncPoints || syncPoints.length < 2) {
        // Fallback for files without sync points: distribute time equally
        const total = this.totalTime() || 0;
        const timeOfOneMeasure = nbMeasures > 0 ? (total / nbMeasures) : 0;
        return Array.from({ length: nbMeasures }).map((_, i) => timeOfOneMeasure * i);
    }
    
    // If already calculated and matches length (cache logic)
    if (this._measurePointsCache && this._measurePointsCache.length === nbMeasures) {
        return this._measurePointsCache;
    }

    const points: number[] = [];
    let endTime = syncPoints[syncPoints.length - 1].time;
    
    for (let i = 0; i < syncPoints.length - 1; i++) {
        const syncPoint = syncPoints[i];
        const nextSyncPoint = syncPoints[i + 1];
        const currentStart = syncPoint.time;
        
        let nbMeasureToInsert = 0;
        let timeOfMeasure = 0;
        
        if ((!nextSyncPoint || nextSyncPoint.type === 'end') && syncPoint.type !== 'end') {
            nbMeasureToInsert = nbMeasures - (syncPoint.location?.measureIdx ?? 0);
            if (nbMeasureToInsert > 0) timeOfMeasure = (endTime - syncPoint.time) / nbMeasureToInsert;
        } else {
            nbMeasureToInsert = (nextSyncPoint.location?.measureIdx ?? 0) - (syncPoint.location?.measureIdx ?? 0);
            if (nbMeasureToInsert > 0) timeOfMeasure = (nextSyncPoint.time - syncPoint.time) / nbMeasureToInsert;
        }
        
        for (let idx = 0; idx < nbMeasureToInsert; idx++) {
            points.push(currentStart + (timeOfMeasure * idx));
        }
    }
    
    this._measurePointsCache = points;
    console.log('[FlatService] _getMeasurePoints generated:', points.length, 'points. First 5:', points.slice(0, 5), 'syncPoints used:', syncPoints);
    return points;
  }

  async findTimeByMeasure(position: any, isEnd = false): Promise<number | null> {
    console.log('[FlatService] findTimeByMeasure called with position:', position, 'isEnd:', isEnd);
    if (!this.embed || !position) {
        console.log('[FlatService] findTimeByMeasure aborted: no embed or position');
        return null;
    }
    
    // Find index by measureUuid
    const embed = this.embed as any;
    let measureIndex = position.measureIdx;
    let measureUuid = position.measureUuid;

    const uuids = await (embed.getMeasuresUuids?.() || embed.call('getMeasuresUuids')).catch(() => []);
    
    if (measureUuid && measureIndex === undefined) {
        measureIndex = uuids.indexOf(measureUuid);
    } else if (measureIndex !== undefined && !measureUuid) {
        measureUuid = uuids[measureIndex];
    }

    if (measureIndex === -1 || measureIndex === undefined || !measureUuid) {
        console.log('[FlatService] findTimeByMeasure aborted: invalid measureIndex or measureUuid', { measureIndex, measureUuid });
        return null;
    }

    let notes: any[] = [];
    if (this._measureNotesCache[measureUuid]) {
      notes = this._measureNotesCache[measureUuid];
    } else {
      let index = 0;
      const maxAttempts = 50;
      while (index < maxAttempts) {
        try {
          const noteData = await embed.call('getNoteData', {
            measureUuid: measureUuid,
            noteIdx: index,
            voiceUuid: position.voiceUuid,
            partUuid: position.partUuid
          });
          if (!noteData) break;
          notes.push(noteData);
          index++;
          await new Promise(resolve => setTimeout(resolve, 10)); // tiny delay
        } catch (e) { break; }
      }
      this._measureNotesCache[measureUuid] = notes;
    }

    const measurePoints = this._getMeasurePoints();
    const startOfMeasure = measurePoints[measureIndex] ?? 0;
    
    if (notes.length > 0 && position.noteIdx !== undefined) {
      const endOfMeasure = (measureIndex < measurePoints.length - 1) ? measurePoints[measureIndex + 1] : startOfMeasure;
      if (startOfMeasure !== undefined && endOfMeasure !== undefined) {
         const subdivisionsPerMeasure = notes.length;
         const timeOfOneNote = (endOfMeasure - startOfMeasure) / subdivisionsPerMeasure;
         // Si isEnd est vrai, on veut la fin de la note (noteIdx + 1), sinon le début de la note (noteIdx)
         const targetIdx = isEnd ? position.noteIdx + 1 : position.noteIdx;
         const timeOfNote = targetIdx * timeOfOneNote;
         return startOfMeasure + timeOfNote;
      }
    }
    
    return isEnd ? (measurePoints[measureIndex + 1] ?? startOfMeasure) : startOfMeasure;
  }

  async getMeasureDetails(): Promise<any> {
    if (!this.embed) return null;
    const embed = this.embed as any;
    try {
        return await (embed.getMeasureDetails?.() || embed.call('getMeasureDetails'));
    } catch (e) {
        return null;
    }
  }

  async setZoom(zoom: number): Promise<void> {
    if (!this.embed) return;
    const embed = this.embed as any;
    await (embed.setZoom?.(zoom) || embed.call('setZoom', zoom));
  }

  async getTempo(): Promise<number> {
    // 1. Try to parse from XML first (user requirement)
    const xml = this._lessonService.xmlContent();
    if (xml) {
        const tempoMatch = xml.match(/<sound\s+[^>]*?tempo="(\d+)"/);
        if (tempoMatch) return parseInt(tempoMatch[1], 10);
    }

    // 2. Fallback to SDK
    if (!this.embed) return 120;
    const embed = this.embed as any;
    try {
        const details = await (embed.getMeasureDetails?.() || embed.call('getMeasureDetails'));
        const detailsArray = Array.isArray(details) ? details : [details];
        return detailsArray[0]?.tempo?.bpm || 120;
    } catch {
        return 120;
    }
  }

  async setTempo(bpm: number): Promise<void> {
    if (!this.embed) return;
    
    // 1. Update the XML content with new tempo
    const currentXml = this._lessonService.xmlContent();
    if (currentXml) {
        // MusicXML tempo is usually in <sound tempo="..."/> or <metronome>
        // We'll use a simple regex to update any 'tempo="..."' in <sound> tag
        let updatedXml = currentXml.replace(/<sound\s+([^>]*?)tempo="(\d+)"/g, `<sound $1tempo="${bpm}"`);
        
        // If not found, try to add it to direction/sound if possible, or just use playbackSpeed as fallback
        if (updatedXml !== currentXml) {
            console.log(`[FlatService] XML tempo updated to ${bpm}. Reloading score...`);
            this._coreDataStore.setXmlContent(updatedXml);
            // The effect in component or service will reload it
            return;
        }
    }

    // Fallback: use playback speed ratio if XML update failed
    console.log(`[FlatService] XML tempo update failed or not found. Using setPlaybackSpeed fallback.`);
    await this.embed.call('setPlaybackSpeed', bpm / 120); // Assumption: base is 120
  }

  async print(): Promise<void> {
    if (this.embed) await this.embed.call('print');
  }

  async getParts(): Promise<any[]> {
    return this.parts();
  }

  async switchLayout(): Promise<void> {
    if (!this.embed) return;
    const next = this._currentLayout() === 'track' ? 'responsive' : 'track';
    this._currentLayout.set(next);
    console.log(`[FlatService] Switching layout to: ${next}`);
    
    const embed = this.embed as any;
    try {
        if (typeof embed.setLayout === 'function') {
            await embed.setLayout({ layout: next });
        } else {
            await embed.call('setLayout', { layout: next });
        }
    } catch (e) {
        try {
            await embed.call('setLayout', next);
        } catch (e2) {
            // Last resort: layout
            await embed.call('layout', { layout: next }).catch(() => {});
        }
    }
  }

  async getNbMeasures(): Promise<number> {
    if (!this.embed) return 0;
    return await this.embed.call('getNbMeasures');
  }

  async setMetronomeVolume(volume: number): Promise<void> {
    if (!this.embed) return;
    try {
      // Try both formats as SDK versions may vary
      await this.embed.call('setMetronomeVolume', { volume });
    } catch {
      try {
        await this.embed.call('setMetronomeVolume', volume);
      } catch (e) {
        console.warn('[FlatService] Failed to set metronome volume', e);
      }
    }
  }

  async setPartVolume(partUuid: string, volume: number): Promise<void> {
    if (this.embed) await this.embed.call('setPartVolume', { partUuid, volume });
  }

  async getPartVolume(partUuid: string): Promise<number> {
    if (!this.embed) return 100;
    return await this.embed.call('getPartVolume', partUuid);
  }

  async setPartMute(partUuid: string, mute: boolean): Promise<void> {
    if (this.embed) {
        if (mute) {
            await this.embed.call('mutePart', { partUuid });
        } else {
            await this.embed.call('unmutePart', { partUuid });
        }
    }
  }

  async setMasterVolume(volume: number): Promise<void> {
    if (!this.embed) return;
    const embed = this.embed as any;
    await (embed.setMasterVolume?.({ volume }) || embed.call('setMasterVolume', { volume }));
  }

  async getMasterVolume(): Promise<number> {
    if (!this.embed) return 100;
    const embed = this.embed as any;
    return await (embed.getMasterVolume?.() || embed.call('getMasterVolume'));
  }

  async setMetronomeMode(mode: number): Promise<void> {
    if (!this.embed) return;
    try {
      await this.embed.call('setMetronomeMode', mode);
    } catch {
      try {
        await this.embed.call('setMetronomeMode', { mode });
      } catch (e) {
        console.warn('[FlatService] Failed to set metronome mode', e);
      }
    }
  }

  async getMetronomeMode(): Promise<number> {
    if (!this.embed) return 0;
    return await this.embed.call('getMetronomeMode');
  }

  async gotoMeasure(delta: number): Promise<void> {
    if (!this.embed) return;
    const embed = this.embed as any;
    try {
        const current = await (embed.getCursorPosition?.() || embed.call('getCursorPosition'));
        if (current) {
            const targetIdx = Math.max(0, current.measureIdx + delta);
            // 1. Visual Move
            await (embed.setCursorPosition?.({ measureIdx: targetIdx }) || embed.call('setCursorPosition', { measureIdx: targetIdx }));
            
            // 2. Audio Move (using measurePoints)
            const points = this._getMeasurePoints();
            if (points && points[targetIdx] !== undefined) {
                const targetTime = points[targetIdx];
                await (embed.setPlaybackPosition?.({ seconds: targetTime }) || embed.call('setPlaybackPosition', { seconds: targetTime }));
            }
        }
    } catch (e) {
        console.error('[FlatService] gotoMeasure failed:', e);
    }
  }

  onCursorPosition(cb: (pos: any) => void): void { this.cursorPositionCallbacks.add(cb); }
  onRangeSelection(cb: (sel: any | null) => void): void { this.rangeSelectionCallbacks.add(cb); }
  onPause(cb: () => void): void { this.pauseCallbacks.add(cb); }
  onStop(cb: () => void): void { this.stopCallbacks.add(cb); }

  destroyEmbed(): void {
    if (this.embed) {
      this.embed = undefined;
      this._isReady.set(false);
      this._isTrackReady.set(false);
    }
  }
}
