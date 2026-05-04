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
  
  public disableInitHack: boolean = false;

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
  private _isUserSelecting = false;
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
    try {
        console.log('[Flat] embed methods:', Object.keys(Object.getPrototypeOf(this.embed)), Object.keys(this.embed));
    } catch(e) {}
    this.embed.on('play', () => { this._isPlaying.set(true); this.playCallbacks.forEach(cb => cb()); });
    this.embed.on('pause', () => { this._isPlaying.set(false); this.pauseCallbacks.forEach(cb => cb()); });
    this.embed.on('stop', () => { this._isPlaying.set(false); this._currentBeat.set(-1); this.stopCallbacks.forEach(cb => cb()); });
    this.embed.on('scoreLoaded', async () => {
      this._isReady.set(true);

      if (this.disableInitHack) return;

   // On crée un wrapper pour simuler le "once"
   const handlePlay = async () => {
     // 1. On se désabonne immédiatement pour ne pas boucler
     this.embed.off('play', handlePlay);

     // 2. On attend un peu que l'audio s'initialise
     await new Promise(resolve => setTimeout(resolve, 50));

     try {
       // 3. On pause
       await this.embed.pause();

       // 4. On replace le curseur
       await this.embed.setCursorPosition({
         measureIdx: 0,
         noteIdx: 0
       });
       console.log('[Flat] Initialisation réussie');
     } catch (err) {
       console.error('[Flat] Erreur pendant le reset:', err);
     }
   };

   // On s'abonne à l'event play
   this.embed.on('play', handlePlay);

   // On lance la machine
   try {
     await this.embed.play();
   } catch (err) {
     console.error('[Flat] play() failed:', err);
   }
 });
    this.embed.on('playbackPosition', (ev: any) => { 
      const time = ev.seconds ?? ev.currentTime ?? 0;
      this._time.set(time); 
      
      // Feature: MIDI Loop Range Support
      if (this._coreDataStore.isMidiMode()) {
        const loopRange = this._coreDataStore.loopRangeRequest();
        if (loopRange && loopRange.start !== null && loopRange.end !== null) {
            // Un petit delta pour s'assurer qu'on ne boucle pas à l'infini sur la même frame
            if (time >= loopRange.end) {
                console.log(`[FlatService] Loop end reached (${time} >= ${loopRange.end}), jumping to start (${loopRange.start})`);
                this.seekTrackTo(loopRange.start);
            }
        }
      }
    });
    let cursorPositionTimeout: any;
    let rangeSelectionTimeout: any;

    this.embed.on('cursorPosition', async (pos: any) => {
      // Protection immédiate : empêcher syncWithAudio (déclenché par requestPause) 
      // de faire un seekTrackTo qui casserait le début d'un glissé (drag)
      this._isUserSelecting = true;

      // Pause globale (Audio et Vidéo)
      this._coreDataStore.requestPause();

      console.log('[FlatService] cursorPosition event received:', pos, '_isSyncing:', this._isSyncing);
      if (pos && pos.beatIdx !== undefined) this._currentBeat.set(pos.beatIdx);
      this.cursorPositionCallbacks.forEach(cb => cb(pos));
      
      // Capture the playing state synchronously because Flat SDK might auto-pause 
      // or other events might trigger a pause during the 150ms timeout.
      const wasPlaying = this._isPlaying();
      
      // Feature 1: Clic sur une note -> seek
      // On ignore l'événement s'il est déclenché par notre propre synchronisation
      if (!this._isSyncing && pos) {
         if (cursorPositionTimeout) clearTimeout(cursorPositionTimeout);
         
         cursorPositionTimeout = setTimeout(async () => {
             this._isUserSelecting = false; // Relâcher la protection si c'était juste un clic
             this._isSyncing = true;
             try {
                 const time = await this.findTimeByMeasure(pos);
                 if (time !== null) {
                     this._time.set(time); // Mettre à jour la barre de progression immédiatement
                     this._coreDataStore.requestSeek(time);
                 }
                 
                 // Pour le mode MIDI pur : forcer le lecteur à sauter sur la note cliquée
                 if (this._coreDataStore.isMidiMode()) {
                     console.log(`[FlatService] cursorPosition: Synchronizing playhead in MIDI mode (wasPlaying: ${wasPlaying})`);
                     await this._syncPlayheadInMidiMode(pos, wasPlaying);
                 }
             } catch (e) { console.error('[FlatService] cursorPosition error:', e); }
             setTimeout(() => { this._isSyncing = false; }, 500);
         }, 150); // Attendre un peu pour voir si ce n'est pas le début d'un "drag" (rangeSelection)
      }
    });

    this.embed.on('rangeSelection', async (sel: any) => {
      this.rangeSelectionCallbacks.forEach(cb => cb(sel));
      
      this._isUserSelecting = true;

      // Annuler le clic simple car on est en train de faire une sélection
      if (cursorPositionTimeout) clearTimeout(cursorPositionTimeout);
      
      // Feature 2: Sélection d'une partie -> set loop
      // Utilisation d'un debounce (trailing) pour ne pas spammer la vidéo pendant le glissement
      if (rangeSelectionTimeout) {
          clearTimeout(rangeSelectionTimeout);
      }

      rangeSelectionTimeout = setTimeout(async () => {
          if (sel && sel.left && sel.right) {
              try {
                 const embed = this.embed as any;
                 
                 console.log('[FlatService] rangeSelection sel.left:', JSON.stringify(sel.left), 'sel.right:', JSON.stringify(sel.right));
                 
                 let start = await this.findTimeByMeasure(sel.left);
                 let end = await this.findTimeByMeasure(sel.right, true);

                 if (start === null) start = 0;
                 
                 // If the user just clicked a single note, sel.left and sel.right are identical.
                 // This is effectively a "deselect range" or "simple seek" action, not a loop creation.
                const isSingleNote = sel.left.measureUuid === sel.right.measureUuid &&
                  sel.left.noteIdx === sel.right.noteIdx &&
                  sel.left.noteIdx !== undefined;
                 
                 if (end === null || end === start || isSingleNote || Math.abs(end - start) < 0.5) {
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
          
          setTimeout(() => { this._isUserSelecting = false; }, 300); // Wait for sync propagation
      }, 150); // 150ms debounce
    });
  }

  async clearSelection(): Promise<void> {
    if (!this.embed || !this._lastLoadedXml) return;
    try {
        console.trace('[FlatService] clearSelection requested, stopping internal loop and re-initializing score...');
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
              const nbMeasures = await this.embed.getNbMeasures();
              if (nbMeasures && nbMeasures > 0) {
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

        let measures = await embed.getNbMeasures().catch(() => 0);

        if (measures === 0) {
          const syncPts = this.syncPoints() as any[];
          if (syncPts && syncPts.length > 0) {
            const lastWithLocation = [...syncPts].reverse().find((s: any) => s.location && s.location.measureIdx !== undefined);
            measures = lastWithLocation ? lastWithLocation.location.measureIdx + 1 : 0;
          }
        }

        this.parts.set(parts);
        this.nbMeasures.set(measures);
        console.log(`[FlatService] Score metadata: ${measures} measures`);
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
    
    // Le SDK Flat considère que `measureIdx` dans les sync points est l'index "joué" (playback)
    // et non l'index visuel (score). S'il y a des reprises, measureIdx 65 correspondra à
    // la 66ème mesure jouée (qui peut être la mesure 62 visuellement !).
    // Pour forcer l'alignement visuel, il faut utiliser les UUIDs des mesures.
    const embed = this.embed as any;
    const uuids = await (embed.getMeasuresUuids?.() || embed.call('getMeasuresUuids')).catch(() => []);
    console.log('[FlatService] setupTrack got uuids length:', uuids ? uuids.length : 0);

    const measurePoints = this._getMeasurePoints();
    const exhaustiveSync: any[] = measurePoints.map((time, idx) => {
        const location: any = {};
        if (uuids && uuids[idx]) {
            location.measureUuid = uuids[idx];
        } else {
            location.measureIdx = idx; // Fallback bête
        }
        return { type: 'measure', time: time, location };
    });
    
    const endPoint = sync.find((s: any) => s.type === 'end');
    if (endPoint) exhaustiveSync.push(endPoint);

    console.log('[FlatService] setupTrack exhaustiveSync length:', exhaustiveSync.length, 'last 5:', exhaustiveSync.slice(-5));

    try {
      await this.embed.call('setTrack', { id: this.TRACK_ID, type: 'external', totalTime: this.totalTime(), synchronizationPoints: exhaustiveSync });
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
    if (!this.embed) return;
    
    if (this._coreDataStore.isMidiMode()) {
       console.log(`[FlatService] seekTrackTo called in MIDI mode with time: ${time}`);
       const embed = this.embed as any;
       // Si on était en lecture, on met en pause AVANT de bouger le curseur
       const wasPlaying = this._isPlaying();
       if (wasPlaying) {
           console.log('[FlatService] seekTrackTo pausing playback before move');
           await this.stop();
       }

       try {
           console.log('[FlatService] attempting setPlaybackPosition...');
           await (embed.setPlaybackPosition?.({ seconds: time }) || embed.call('setPlaybackPosition', { seconds: time }));
           
           if (wasPlaying) {
               console.log('[FlatService] seekTrackTo restarting playback');
               await this.play();
           }
       } catch (e) {
           console.log('[FlatService] setPlaybackPosition failed, falling back to setCursorPosition', e);
           const points = this._getMeasurePoints();
           let targetIdx = 0;
           for (let i = 0; i < points.length; i++) {
               if (time >= points[i]) targetIdx = i;
               else break;
           }
           console.log(`[FlatService] Target measureIdx: ${targetIdx}`);
           await this._syncPlayheadInMidiMode({ measureIdx: targetIdx }, wasPlaying);
       }
       return;
    }

    await this.embed.call('seekTrackTo', { time }).catch(() => {});
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
    try {
      // 1. D'abord, recaler Flat si le décalage est important (> 0.5s)
      const flatTime = this._time();
      if (!this._isUserSelecting && Math.abs(flatTime - audioTime) > 0.5) {
        this._isSyncing = true;
        await this.seekTrackTo(audioTime);
        setTimeout(() => { this._isSyncing = false; }, 500);
      }

      // 2. Ensuite, lancer ou mettre en pause la lecture
      if (isPlaying && !this._isPlaying()) {
          await this.embed.play();
      } else if (!isPlaying && this._isPlaying()) {
          await this.embed.pause();
      }
    } catch (e) {
        console.error('[FlatService] syncWithAudio error:', e);
        this._isSyncing = false;
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

    const points: number[] = new Array(nbMeasures).fill(undefined);
    
    // 1. Fill known points
    for (const sp of syncPoints) {
        if (sp.location && sp.location.measureIdx !== undefined && sp.location.measureIdx < nbMeasures) {
            points[sp.location.measureIdx] = sp.time;
        }
    }
    
    // Default measure 0 to time 0 if missing
    if (points[0] === undefined) {
        points[0] = syncPoints.length > 0 ? syncPoints[0].time : 0;
    }

    // 2. Interpolate gaps
    let lastKnownIdx = 0;
    let lastKnownTime = points[0];
    
    for (let i = 1; i < nbMeasures; i++) {
        if (points[i] !== undefined) {
            const gap = i - lastKnownIdx;
            const timeGap = points[i] - lastKnownTime;
            for (let j = lastKnownIdx + 1; j < i; j++) {
                points[j] = lastKnownTime + (timeGap * (j - lastKnownIdx) / gap);
            }
            lastKnownIdx = i;
            lastKnownTime = points[i];
        }
    }
    
    // 3. Extrapolate any remaining measures at the end
    if (lastKnownIdx < nbMeasures - 1) {
        let endTime = this.totalTime() || 0;
        const endPoint = syncPoints.find(sp => sp.type === 'end');
        if (endPoint) {
            endTime = endPoint.time;
        }
        
        const gap = nbMeasures - lastKnownIdx;
        const timeGap = endTime - lastKnownTime;
        for (let j = lastKnownIdx + 1; j < nbMeasures; j++) {
             points[j] = lastKnownTime + (timeGap * (j - lastKnownIdx) / gap);
        }
    }
    
    this._measurePointsCache = points;
    console.log('[FlatService] _getMeasurePoints generated:', points.length, 'points. First 5:', points.slice(0, 5));
    return points;
  }

  async findTimeByMeasure(position: any, isEnd = false): Promise<number | null> {
    if (!this.embed || !position) {
        return null;
    }

    let measureIndex = position.measureIdx;
    
    // Si l'événement (comme rangeSelection) ne fournit que le measureUuid, on retrouve l'index
    if (measureIndex === undefined && position.measureUuid) {
        const embed = this.embed as any;
        const uuids = await (embed.getMeasuresUuids?.() || embed.call('getMeasuresUuids')).catch(() => []);
        measureIndex = uuids.indexOf(position.measureUuid);
    }

    if (measureIndex === -1 || measureIndex === undefined) {
        return null;
    }

    const measurePoints = this._getMeasurePoints();
    const startOfMeasure = measurePoints[measureIndex] ?? 0;
    
    // Pour l'instant, on n'utilise plus les uuids pour récupérer les notes car
    // getMeasuresUuids fait crasher le SDK Flat sur certaines partitions.
    // On se repose donc sur measurePoints (qui est très fiable) pour trouver le temps.

    // Si l'utilisateur clique sur une note spécifique (ex: milieu de mesure)
    // On pourrait utiliser getNoteData, mais comme partUuid est souvent invalide,
    // on fait une interpolation simple basée sur noteIdx si on l'a, sinon on prend le début/fin de la mesure.
    let endOfMeasure = measurePoints[measureIndex + 1];

    if (isEnd && endOfMeasure === undefined) {
      // C'est la dernière mesure de la partition, on utilise le temps total
      endOfMeasure = this.totalTime() || startOfMeasure;
    }

    if (position.noteIdx !== undefined && position.noteIdx > 0 && endOfMeasure !== undefined) {
      // Pour l'interpolation, on ne connait pas le nombre exact de notes dans la mesure.
      // On suppose 4 par défaut, MAIS on s'assure de ne jamais dépasser endOfMeasure !
      // Plus la noteIdx est grande, plus on se rapproche de endOfMeasure sans jamais le franchir.
      const timeGap = endOfMeasure - startOfMeasure;
      const fallbackMaxNotes = Math.max(position.noteIdx + 1, 4); // S'adapte si la mesure a beaucoup de notes
      const timeOfOneNote = timeGap / fallbackMaxNotes;
      
      const targetIdx = isEnd ? position.noteIdx + 1 : position.noteIdx;
      const interpolatedTime = startOfMeasure + (targetIdx * timeOfOneNote);
      
      // Sécurité absolue : on ne dépasse jamais la fin de la mesure
      return Math.min(interpolatedTime, endOfMeasure - 0.01);
    }
    
    return isEnd ? (endOfMeasure ?? startOfMeasure) : startOfMeasure;
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
          await (embed.setCursorPosition?.({ measureIdx: targetIdx }));
            
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
  onPlay(cb: () => void): void { this.playCallbacks.add(cb); }
  onPause(cb: () => void): void { this.pauseCallbacks.add(cb); }
  onStop(cb: () => void): void { this.stopCallbacks.add(cb); }

  destroyEmbed(): void {
    if (this.embed) {
      this.embed = undefined;
      this._isReady.set(false);
      this._isTrackReady.set(false);
    }
  }

  /**
   * Pour forcer l'API Flat à mémoriser la nouvelle tête de lecture en mode MIDI pur,
   * il faut utiliser stop() et parfois "tromper" le lecteur avec une brève lecture.
   */
  private async _syncPlayheadInMidiMode(pos: any, wasPlaying: boolean): Promise<void> {
      if (!this.embed) return;
      const embed = this.embed as any;
      if (wasPlaying) {
          await this.stop();
          await (embed.setCursorPosition?.(pos) || embed.call('setCursorPosition', pos)).catch(() => {});
          await this.play();
      } else {
          await this.stop();
          await this.play();
          await (embed.setCursorPosition?.(pos) || embed.call('setCursorPosition', pos)).catch(() => {});
          await this.pause();
      }
  }
}
