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
  readonly syncPoints = computed(() => this._coreDataStore.syncPoints());
  
  readonly totalTime = computed(() => this._coreDataStore.totalTime());
  readonly parts = signal<any[]>([]);
  readonly measureDetails = signal<MeasureDetails[]>([]);
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
    this.embed.on('cursorPosition', (pos: any) => {
      if (pos && pos.beatIdx !== undefined) this._currentBeat.set(pos.beatIdx);
      this.cursorPositionCallbacks.forEach(cb => cb(pos));
    });
    this.embed.on('rangeSelection', (sel: any) => this.rangeSelectionCallbacks.forEach(cb => cb(sel)));
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
                await this.embed.call('getNbMeasures');
                resolve(true);
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
        const playbackDetails = await (embed.getPlaybackDetails?.() || embed.call('getPlaybackDetails')).catch(() => ({ playbackDuration: 0 }));

        this.parts.set(parts);
        const duration = playbackDetails?.playbackDuration || 0;
        if (duration) this._duration.set(duration);
        console.log(`[FlatService] Score metadata: ${measures} measures, ${duration}s duration`);
      } catch (e) {
        console.warn('[FlatService] Error fetching metadata:', e);
      }

      // 2. Fetch Measure Details for seek mapping
      const embed = this.embed as any;
      const rawDetails = await (embed.getMeasureDetails?.() || embed.call('getMeasureDetails'));
      const detailsArray = Array.isArray(rawDetails) ? rawDetails : [rawDetails];
      
      const mappedDetails = detailsArray.map((m: any) => ({
        ...m,
        startTime: m.startTime ?? m.stime,
        endTime: m.endTime ?? m.etime
      }));

      this.measureDetails.set(mappedDetails);

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
        } else if (mappedDetails.length > 0) {
            const last = mappedDetails[mappedDetails.length - 1];
            if (last.endTime) this._duration.set(last.endTime);
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

  syncWithAudio(audioTime: number, isPlaying: boolean): void {
    if (!this.embed) return;
    if (isPlaying && !this._isPlaying()) this.play();
    else if (!isPlaying && this._isPlaying()) this.pause();
    this.seekTrackTo(audioTime);
  }

  async findTimeByMeasure(position: any, useStart = false): Promise<number | null> {
    if (!this.embed || !position) return null;
    const details = this.measureDetails();
    const measure = details[position.measureIdx];
    return measure ? (useStart ? measure.startTime : measure.endTime) ?? null : null;
  }

  async getMeasureDetails(): Promise<any> {
    const details = this.measureDetails();
    return details && details.length > 0 ? details[0] : details;
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
            
            // 2. Audio Move (if we have details)
            const details = this.measureDetails();
            if (details && details[targetIdx]) {
                const targetTime = details[targetIdx].startTime;
                if (targetTime !== undefined) {
                    await (embed.setPlaybackPosition?.({ seconds: targetTime }) || embed.call('setPlaybackPosition', { seconds: targetTime }));
                }
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
