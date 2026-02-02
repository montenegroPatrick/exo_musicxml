import {
  computed,
  effect,
  inject,
  Injectable,
  Signal,
  signal,
} from '@angular/core';
import { LessonService } from '@app/modules/lesson/services/lesson.service';
import { ILesson, TrackList } from '@core/interfaces/lesson.interface';
import { environment } from '@environments/environment';

interface AudioTrack {
  name: string;
  label: string;
  buffer: AudioBuffer;
  sourceNode: AudioBufferSourceNode | null;
  gainNode: GainNode;
  volume: number;
}

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private _lessonService = inject(LessonService);

  private _lessonJson: Signal<ILesson | null> = computed(() =>
    this._lessonService.lessonJson(),
  );
  private _audioContext: AudioContext = new AudioContext();
  private _masterGainNode: GainNode = this._audioContext.createGain();
  private _audioTracks = signal<AudioTrack[]>([]);
  private _duration = signal<number>(0);
  private _currentTime = signal<number>(0);
  private _isPlaying = signal<boolean>(false);
  private _startTime = 0;
  private _pausedAt = 0;
  private _playbackRate = signal<number>(1);
  private _animationFrameId: number | null = null;
  private _folderSound = computed(
    () => `${this._lessonJson()?.folder ?? ''}/sound`,
  );
  private _isReady = signal<boolean>(false);
  isReady = computed(() => this._isReady());
  duration = computed(() => this._duration());
  currentTime = computed(() => this._currentTime());
  isPlaying = computed(() => this._isPlaying());
  tracks = computed(() => this._lessonJson()?.trackList);
  audioTracks = computed(() => this._audioTracks());
  playbackRate = computed(() => this._playbackRate());
  retry = signal<boolean>(false);
  constructor() {
    this._masterGainNode.connect(this._audioContext.destination);
    this.init();
  }

  async init(): Promise<void> {
    this._isReady.set(false);
    console.log(this.tracks());
    if (!this.tracks()) return;
    const trackList = this.tracks()!;
    const folder = this._folderSound();
    if (!folder || trackList.length === 0) {
      return;
    }

    // Resume audio context if suspended (browser autoplay policy)
    if (this._audioContext.state === 'suspended') {
      console.log('Audio context is suspended');
      if (this.retry()) return;
      setTimeout(() => {
        this.retry.set(true);
      }, 100);
    }

    const loadedTracks: AudioTrack[] = [];

    for (const track of trackList) {
      if (!track.name) continue;

      const audioUrl = `${folder}/${track.name}`;
      console.log(audioUrl);
      const buffer = await this._loadAudioBuffer(audioUrl);

      if (buffer) {
        const gainNode = this._audioContext.createGain();
        gainNode.connect(this._masterGainNode);

        loadedTracks.push({
          name: track.name,
          label: track.label ?? track.name,
          buffer,
          sourceNode: null,
          gainNode,
          volume: 1,
        });
      }
    }

    this._audioTracks.set(loadedTracks);

    // Set duration from the longest track
    const maxDuration = Math.max(...loadedTracks.map((t) => t.buffer.duration));
    this._duration.set(maxDuration);
    this._isReady.set(true);
  }

  private async _loadAudioBuffer(url: string): Promise<AudioBuffer | null> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await this._audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error(`Failed to load audio: ${url}`, error);
      return null;
    }
  }

  private _createSourceNodes(): void {
    const tracks = this._audioTracks();
    const updatedTracks = tracks.map((track) => {
      const sourceNode = this._audioContext.createBufferSource();
      sourceNode.buffer = track.buffer;
      sourceNode.playbackRate.value = this._playbackRate();
      sourceNode.connect(track.gainNode);
      return { ...track, sourceNode };
    });
    this._audioTracks.set(updatedTracks);
  }

  private _startTimeUpdate(): void {
    const update = () => {
      if (this._isPlaying()) {
        const elapsed =
          (this._audioContext.currentTime - this._startTime) *
          this._playbackRate();
        const newTime = this._pausedAt + elapsed;

        if (newTime >= this._duration()) {
          this.stop();
          return;
        }

        this._currentTime.set(newTime);
        this._animationFrameId = requestAnimationFrame(update);
      }
    };
    this._animationFrameId = requestAnimationFrame(update);
  }

  private _stopTimeUpdate(): void {
    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }

  play(): void {
    console.log('play');
    if (this._isPlaying() || this._audioTracks().length === 0) return;

    this._createSourceNodes();
    this._startTime = this._audioContext.currentTime;

    const tracks = this._audioTracks();
    tracks.forEach((track) => {
      track.sourceNode?.start(0, this._pausedAt);
    });

    this._isPlaying.set(true);
    this._startTimeUpdate();
  }

  pause(): void {
    if (!this._isPlaying()) return;

    this._pausedAt = this._currentTime();
    this._stopAllSources();
    this._isPlaying.set(false);
    this._stopTimeUpdate();
  }

  stop(): void {
    this._stopAllSources();
    this._pausedAt = 0;
    this._currentTime.set(0);
    this._isPlaying.set(false);
    this._stopTimeUpdate();
  }

  private _stopAllSources(): void {
    const tracks = this._audioTracks();
    tracks.forEach((track) => {
      if (track.sourceNode) {
        try {
          track.sourceNode.stop();
        } catch {
          // Source may already be stopped
        }
        track.sourceNode.disconnect();
        track.sourceNode = null;
      }
    });
  }

  seek(time: number): void {
    const wasPlaying = this._isPlaying();
    if (wasPlaying) {
      this._stopAllSources();
      this._stopTimeUpdate();
    }

    this._pausedAt = Math.max(0, Math.min(time, this._duration()));
    this._currentTime.set(this._pausedAt);

    if (wasPlaying) {
      this._createSourceNodes();
      this._startTime = this._audioContext.currentTime;
      const tracks = this._audioTracks();
      tracks.forEach((track) => {
        track.sourceNode?.start(0, this._pausedAt);
      });
      this._startTimeUpdate();
    }
  }

  setVolume(volume: number): void {
    this._masterGainNode.gain.value = volume / 100;
  }

  setTrackVolume(trackIndex: number, volume: number): void {
    const tracks = this._audioTracks();
    if (trackIndex >= 0 && trackIndex < tracks.length) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      tracks[trackIndex].gainNode.gain.value = clampedVolume;
      tracks[trackIndex].volume = clampedVolume;
    }
  }

  setPlaybackRate(rate: number): void {
    const clampedRate = Math.max(0.25, Math.min(2, rate));
    this._playbackRate.set(clampedRate);

    const tracks = this._audioTracks();
    tracks.forEach((track) => {
      if (track.sourceNode) {
        track.sourceNode.playbackRate.value = clampedRate;
      }
    });
  }

  destroy(): void {
    this.stop();
    this._audioContext.close();
  }
}
