import {
  computed,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import { CoreDataService } from './core-data.service';
import { TrackList } from '@core/interfaces/lesson.interface';
import { environment } from '@environments/environment';
import { FlatService } from './flat.service';

export interface ITimeListener {
  syncWithAudio(time: number, isPlaying: boolean): void;
  onAudioPlay?(): void;
  onAudioPause?(): void;
}

interface AudioTrack {
  name: string;
  label: string;
  buffer: AudioBuffer;
  sourceNode: AudioBufferSourceNode | null;
  stretchNode: AudioWorkletNode | null; // <-- Nouveau nœud
  pannerNode: StereoPannerNode;
  analyserNode: AnalyserNode;
  gainNode: GainNode;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private _coreData = inject(CoreDataService);
  private _flatService = inject(FlatService);

  private _lessonJson = this._coreData.lessonJson;
  private _audioContext: AudioContext = new AudioContext();
  private _masterGainNode: GainNode = this._audioContext.createGain();
  private _masterAnalyser: AnalyserNode = this._audioContext.createAnalyser();
  
  private readonly _audioTracks = signal<AudioTrack[]>([]);
  private readonly _duration = signal<number>(0);
  private readonly _currentTime = signal<number>(0);
  private readonly _isPlaying = signal<boolean>(false);
  private readonly _masterVolume = signal<number>(100);
  private readonly _isReady = signal<boolean>(false);
  private readonly _playbackRate = signal<number>(1);

  // -- Loop State --
  private readonly _isLooping = signal<boolean>(false);
  private readonly _loopStart = signal<number | null>(null);
  private readonly _loopEnd = signal<number | null>(null);
  
  private _startTime = 0;
  private _pausedAt = 0;
  private _animationFrameId: number | null = null;
  private _isInitializing = false;
  private _isWorkletLoaded = false;
  
  // -- Time Synchronization Listeners --
  private _listeners: ITimeListener[] = [];
  private _frameCounter = 0; // For logging periodicity
  
  // -- Public Readonly Accessors --
  readonly isReady = this._isReady.asReadonly();
  readonly duration = this._duration.asReadonly();
  readonly currentTime = this._currentTime.asReadonly();
  readonly isPlaying = this._isPlaying.asReadonly();
  readonly audioTracks = this._audioTracks.asReadonly();
  readonly playbackRate = this._playbackRate.asReadonly();
  readonly masterVolume = this._masterVolume.asReadonly();
  readonly isLooping = this._isLooping.asReadonly();
  readonly loopStart = this._loopStart.asReadonly();
  readonly loopEnd = this._loopEnd.asReadonly();
  
  readonly masterAnalyser = computed(() => this._masterAnalyser);

  readonly folderSound = this._coreData.folderSound;
  readonly tracks = this._coreData.trackList;
  
  readonly hasSolo = computed(() => this._audioTracks().some(t => t.solo));

  readonly retry = signal<boolean>(false);

  constructor() {
    this._masterAnalyser.fftSize = 256;
    this._masterGainNode.connect(this._masterAnalyser);
    this._masterAnalyser.connect(this._audioContext.destination);
    
    // Auto-init when lesson data changes
    effect(() => {
      const t = this.tracks();
      if (t && t.length > 0) {
        untracked(() => this.init());
      }
    });

    // -- Tracé de signal logic --
    effect(() => {
      const playing = this._isPlaying();
      console.log(`%c[AudioService:Trace] isPlaying changed to: ${playing}`, 'background: #333; color: #FFEB3B; padding: 2px 5px; font-weight: bold');
    });

    // -- Inverse Interactivity (Score -> Audio) --
    effect(() => {
      const request = this._coreData.seekRequest();
      if (request) {
        untracked(() => {
          // L'audio ne réagit que si des pistes sont chargées (mode lesson-playback)
          if (this._audioTracks().length > 0) {
            console.log(`[AudioService] Inverse Seek requested via CoreData: ${request.time}s`);
            this.seek(request.time);
          }
        });
      }
    });

    effect(() => {
      const request = this._coreData.loopRangeRequest();
      if (request) {
        untracked(() => {
          if (this._audioTracks().length > 0) {
             console.log(`[AudioService] Loop Range requested via CoreData: [${request.start}s - ${request.end}s]`);
             this.setLoopRange(request.start, request.end);
             
             if (request.source === 'ui') {
               this._flatService.clearSelection();
             }
          }
        });
      }
    });

    // -- Global Pause Coordination --
    effect(() => {
      const request = this._coreData.pauseRequest();
      if (request) {
        untracked(() => {
          console.log('[AudioService] Global Pause requested for synchronization');
          this.pause();
        });
      }
    });

    effect(() => {
      const request = this._coreData.playRequest();
      if (request) {
        untracked(() => {
          console.log('[AudioService] Global Play requested');
          this.play();
        });
      }
    });

    effect(() => {
      const request = this._coreData.rateRequest();
      if (request) {
        untracked(() => {
          console.log(`[AudioService] Global Rate Change requested: ${request.rate}`);
          this.internalSetRate(request.rate);
        });
      }
    });
  }

  private async _ensureWorkletLoaded(): Promise<void> {
    if (this._isWorkletLoaded) return;
    try {
      // Le chemin pointe vers le fichier copié dans public/workers/
      await this._audioContext.audioWorklet.addModule('/workers/SignalsmithStretch.js');
      this._isWorkletLoaded = true;
      console.log('%c[AudioService] SignalsmithStretch Worklet loaded successfully!', 'color: #4CAF50');
    } catch (e) {
      console.error('[AudioService] Failed to load SignalsmithStretch Worklet:', e);
    }
  }

  async init(): Promise<void> {
    if (this._isInitializing) return;
    this._isInitializing = true;

    try {
      await this._ensureWorkletLoaded();
      const trackList = this.tracks();
      const folder = this.folderSound();
      
      // Protection : éviter de réinitialiser si les pistes sont identiques
      const currentTracks = untracked(() => this._audioTracks());
      const isSame = currentTracks.length === trackList.length && 
                     trackList.every((t, i) => t.name === currentTracks[i]?.name);
      
      if (isSame && currentTracks.length > 0) {
        return;
      }

      this._isReady.set(false);
      console.log('%c[AudioService] Initializing audio engine...', 'color: #03A9F4');
      
      if (!trackList || trackList.length === 0) {
        console.warn('[AudioService] No tracks found in trackList');
        return;
      }

      // Stop current sounds
      this.stop();

      const loadedTracks: AudioTrack[] = [];

      for (const track of trackList) {
        if (!track.name) continue;

        let audioUrl = '';
        if (track.name.startsWith('http')) {
          audioUrl = track.name;
        } else {
          const baseFolder = folder.endsWith('/') ? folder.slice(0, -1) : folder;
          const trackName = track.name.startsWith('/') ? track.name.slice(1) : track.name;
          audioUrl = `${baseFolder}/sound/${trackName}`;
        }
          
        const buffer = await this._loadAudioBuffer(audioUrl);

        if (buffer) {
          const pannerNode = this._audioContext.createStereoPanner();
          const analyserNode = this._audioContext.createAnalyser();
          analyserNode.fftSize = 256;
          const gainNode = this._audioContext.createGain();
          
          pannerNode.connect(analyserNode);
          analyserNode.connect(gainNode);
          gainNode.connect(this._masterGainNode);

          loadedTracks.push({
            name: track.name,
            label: track.label ?? track.name,
            buffer,
            sourceNode: null,
            stretchNode: null,
            pannerNode,
            analyserNode,
            gainNode,
            volume: 1,
            pan: 0,
            mute: false,
            solo: false,
          });
        }
      }

      this._audioTracks.set(loadedTracks);

      if (loadedTracks.length > 0) {
        const maxDuration = Math.max(...loadedTracks.map((t) => t.buffer.duration));
        this._duration.set(maxDuration);
        this._isReady.set(true);
      }
    } finally {
      this._isInitializing = false;
    }
  }

  private async _loadAudioBuffer(url: string): Promise<AudioBuffer | null> {
    // console.log(`[AudioService] Fetching: ${url}`);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
   //   // console.log(`[AudioService] Decoding: ${url} (${arrayBuffer.byteLength} bytes)`);
      const buffer = await this._audioContext.decodeAudioData(arrayBuffer);
     // // console.log(`[AudioService] Success: ${url}`);
      return buffer;
    } catch (error) {
      console.error(`%c[AudioService] FATAL: Failed to load track: ${url}`, 'background: #b00020; color: white; font-weight: bold; padding: 2px 5px;', error);
      return null;
    }
  }

  private _createSourceNodes(): void {
    const tracks = this._audioTracks();
    const playbackRate = this._playbackRate();
    const useCheaper = tracks.length > 4;
    
    tracks.forEach((track) => {
      // 1. Source
      const sourceNode = this._audioContext.createBufferSource();
      sourceNode.buffer = track.buffer;
      sourceNode.playbackRate.value = playbackRate;
      
      // 2. Stretch Node (si chargé)
      if (this._isWorkletLoaded) {
        try {
          track.stretchNode = new AudioWorkletNode(this._audioContext, 'signalsmith-stretch', {
            outputChannelCount: [2]
          });
          // Appliquer le preset si besoin
          if (useCheaper) {
            track.stretchNode.port.postMessage([0, 'configure', { preset: 'cheaper' }]);
          }
          
          // Calculer le transposeFactor pour compenser le playbackRate
          // Si on ralentit par 0.5, on doit monter le pitch par 2.0 pour rester stable
          const transpose = 1 / (playbackRate || 1);
          track.stretchNode.port.postMessage([1, 'start', { 
            active: true, 
            rate: 1, // On laisse la vitesse à la source, on ne fait que du pitch shifting ici
            semitones: 12 * Math.log2(transpose) 
          }]);

          sourceNode.connect(track.stretchNode);
          track.stretchNode.connect(track.pannerNode);
        } catch (e) {
          console.warn('[AudioService] Could not create StretchNode, falling back to direct connection', e);
          sourceNode.connect(track.pannerNode);
        }
      } else {
        sourceNode.connect(track.pannerNode);
      }

      track.sourceNode = sourceNode;
    });
  }

  private _startTimeUpdate(): void {
    // console.log('[AudioService] Starting time update');
    const update = () => {
      try {
        if (this._isPlaying()) {
          const elapsed =
            (this._audioContext.currentTime - this._startTime) *
            this._playbackRate();
          let newTime = this._pausedAt + elapsed;

          // Loop check
          if (this._isLooping() && this._loopEnd() !== null && newTime >= this._loopEnd()!) {
            // console.log(`[AudioService] Loop back triggered: ${newTime} >= ${this._loopEnd()}`);
            this._loopBack(this._loopStart() || 0);
            return;
          }

          if (newTime >= this._duration()) {
            this.stop();
            return;
          }

          this._currentTime.set(newTime);
          
          // Notify imperative listeners
          this._frameCounter++;
          if (this._frameCounter % 60 === 0) {
            // console.log(`[AudioService:Notify] notifying ${this._listeners.length} listeners at ${newTime.toFixed(2)}s`);
          }
          this._listeners.forEach(l => l.syncWithAudio(newTime, true));

          this._animationFrameId = requestAnimationFrame(update);
        }
      } catch (err) {
        console.error('[AudioService] Timer update error:', err);
      }
    };
    this._animationFrameId = requestAnimationFrame(update);
  }

  private _loopBack(time: number): void {
    // console.log('[AudioService] Internal Recirculation (no state change)');
    this._stopAllSources();
    this._stopTimeUpdate();
    
    this._pausedAt = Math.max(0, Math.min(time, this._duration()));
    this._currentTime.set(this._pausedAt);
    
    // Ensure context is active
    if (this._audioContext.state === 'suspended') {
      this._audioContext.resume();
    }
    
    // Resume without flipping _isPlaying signal to avoid side effects
    this._createSourceNodes();
    this._startTime = this._audioContext.currentTime;
    const tracks = this._audioTracks();
    tracks.forEach((track) => {
      track.sourceNode?.start(0, this._pausedAt);
    });
    this._startTimeUpdate();
  }

  private _stopTimeUpdate(): void {
    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }

  async play(): Promise<void> {
    const isPlaying = untracked(() => this._isPlaying());
    const tracks = this._audioTracks();
    
    console.log('%c[AudioService] PLAY CLICKED', 'background: #4CAF50; color: white; padding: 2px 5px;', { isPlaying, trackCount: tracks.length });
    
    if (isPlaying || tracks.length === 0) {
      if (tracks.length === 0) {
        console.error('%c[AudioService] CANNOT PLAY: No tracks loaded or ready!', 'background: #b00020; color: white; font-weight: bold; padding: 2px 5px;');
      }
      return;
    }

    this._isPlaying.set(true); // Instant UI feedback

    try {
      if (this._audioContext.state === 'suspended') {
        this._audioContext.resume().catch(e => console.error('[AudioService] Resume failed:', e));
      }

      this._createSourceNodes();
      this._startTime = this._audioContext.currentTime;

      tracks.forEach((track) => {
        if (track.sourceNode && track.buffer) {
           track.sourceNode.start(0, Math.min(this._pausedAt, track.buffer.duration));
        }
      });

      console.log('%c[AudioService] PLAY ENGINE STARTED', 'background: #2E7D32; color: white; padding: 2px 5px;');
      
      this._listeners.forEach(l => {
        try {
          l.onAudioPlay?.();
        } catch (e) {
          console.error('[AudioService] Listener onAudioPlay error:', e);
        }
      });
      
      this._startTimeUpdate();
    } catch (error) {
      console.error('%c[AudioService] PLAY FATAL ERROR', 'background: #b00020; color: white; padding: 2px 5px;', error);
      this._isPlaying.set(false);
      this._stopAllSources();
    }
  }

  pause(): void {
    if (!this._isPlaying()) return;

    this._pausedAt = this._currentTime();
    this._stopAllSources();
    this._isPlaying.set(false);
    this._stopTimeUpdate();
    
    // Notify imperative listeners
    // console.log('%c[AudioService] Pause Requested - Notifying listeners', 'color: #F44336; font-weight: bold');
    this._listeners.forEach(l => l.onAudioPause?.());
    this._listeners.forEach(l => l.syncWithAudio(this._pausedAt, false));
  }

  stop(): void {
    this._stopAllSources();
    this._pausedAt = 0;
    this._currentTime.set(0);
    this._isPlaying.set(false);
    this._stopTimeUpdate();
    
    // Notify imperative listeners
    this._listeners.forEach(l => l.syncWithAudio(0, false));
  }

  registerListener(listener: ITimeListener): void {
    if (!this._listeners.includes(listener)) {
      // console.log('%c[AudioService] New listener registered: ' + listener.constructor.name, 'background: #222; color: #bada55; font-weight: bold');
      this._listeners.push(listener);
    }
  }

  unregisterListener(listener: ITimeListener): void {
    this._listeners = this._listeners.filter(l => l !== listener);
  }

  private _stopAllSources(): void {
    const tracks = this._audioTracks();
    tracks.forEach((track) => {
      if (track.sourceNode) {
        try {
          track.sourceNode.stop();
        } catch {}
        track.sourceNode.disconnect();
        track.sourceNode = null;
      }
      if (track.stretchNode) {
        track.stretchNode.disconnect();
        track.stretchNode = null;
      }
    });
  }

  seek(time: number): void {
    const wasPlaying = untracked(() => this._isPlaying());
    
    this._stopAllSources();
    this._stopTimeUpdate();
    
    // NOTE: Don't set _isPlaying to false here if we are about to play again
    // to avoid flickering and unwanted triggers in effects.
    if (!wasPlaying) {
      this._isPlaying.set(false);
    }

    this._pausedAt = Math.max(0, Math.min(time, this._duration()));
    this._currentTime.set(this._pausedAt);

    if (wasPlaying) {
      // Force restart of sources
      this._isPlaying.set(false); // Toggle to allow play() to run
      this.play();
    }
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
    this._masterVolume.set(volume);
    this._masterGainNode.gain.setTargetAtTime(volume / 100, this._audioContext.currentTime, 0.015);
  }

  setTrackVolume(trackIndex: number, volume: number): void {
    const tracks = this._audioTracks();
    if (trackIndex >= 0 && trackIndex < tracks.length) {
      const track = tracks[trackIndex];
      track.volume = Math.max(0, Math.min(1, volume));
      this._updateTrackGain(trackIndex);
    }
  }

  setTrackPan(trackIndex: number, pan: number): void {
    const tracks = this._audioTracks();
    if (trackIndex >= 0 && trackIndex < tracks.length) {
      const track = tracks[trackIndex];
      track.pan = Math.max(-1, Math.min(1, pan));
      track.pannerNode.pan.setTargetAtTime(track.pan, this._audioContext.currentTime, 0.015);
      this._audioTracks.set([...tracks]);
    }
  }

  toggleMute(trackIndex: number): void {
    const tracks = this._audioTracks();
    if (trackIndex >= 0 && trackIndex < tracks.length) {
      tracks[trackIndex].mute = !tracks[trackIndex].mute;
      this._updateTrackGain(trackIndex);
      this._audioTracks.set([...tracks]);
    }
  }

  toggleSolo(trackIndex: number): void {
    const tracks = this._audioTracks();
    if (trackIndex >= 0 && trackIndex < tracks.length) {
      tracks[trackIndex].solo = !tracks[trackIndex].solo;
      
      // Update ALL tracks to reflect new solo state
      tracks.forEach((_, i) => this._updateTrackGain(i));
      this._audioTracks.set([...tracks]);
    }
  }

  private _updateTrackGain(trackIndex: number): void {
    const tracks = this._audioTracks();
    const track = tracks[trackIndex];
    const anySolo = this.hasSolo();
    
    let targetGain = 0;
    
    if (anySolo) {
      // If any track is solo, only solo tracks play
      targetGain = track.solo ? track.volume : 0;
    } else {
      // Otherwise, only non-muted tracks play
      targetGain = track.mute ? 0 : track.volume;
    }
    
    track.gainNode.gain.setTargetAtTime(targetGain, this._audioContext.currentTime, 0.015);
  }

  setPlaybackRate(rate: number): void {
    if (this._flatService.isReady()) {
      // On déclenche le processus complet de recalage via FlatService
      this._flatService.reinitializeTrackWithSpeed(rate);
    } else {
      // Mode mono-piste / PDF : application directe
      this.internalSetRate(rate);
    }
  }

  /** Internal method to actually apply the rate once synchronized */
  internalSetRate(rate: number): void {
    this._playbackRate.set(rate);
    const tracks = this._audioTracks();
    const transpose = 1 / (rate || 1);
    const semitones = 12 * Math.log2(transpose);

    tracks.forEach((track) => {
      if (track.sourceNode) {
        track.sourceNode.playbackRate.setTargetAtTime(rate, this._audioContext.currentTime, 0.015);
      }
      if (track.stretchNode) {
        track.stretchNode.port.postMessage([Date.now(), 'schedule', { 
          semitones: semitones,
          outputTime: this._audioContext.currentTime 
        }]);
      }
    });
  }

  destroy(): void {
    this.stop();
    this._audioContext.close();
  }
}
