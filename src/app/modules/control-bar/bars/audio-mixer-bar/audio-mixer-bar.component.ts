import { Component, computed, inject, input, signal, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { BridgeService } from '@core/services/bridge.service';
import { LessonService } from '@app/modules/lesson/services/lesson.service';
import { PlayControlsComponent } from '../../components/play-controls/play-controls.component';
import { SpeedControlComponent } from '../../components/speed-control/speed-control.component';
import { TrackMixerComponent } from '../../components/track-mixer/track-mixer.component';
import { UnifiedMixerComponent } from '../../components/unified-mixer/unified-mixer.component';
import { TimelineSliderComponent } from '../../components/timeline-slider/timeline-slider.component';
import { VolumeControlComponent } from '../volume-control/volume-control.component';
import { FlatService } from '@core/services/flat.service';
import { ControlBarService } from '../../services/control-bar.service';
import { AudioService } from '@core/services/audio.service';
import { LessonMetadataComponent } from '../../components/lesson-metadata/lesson-metadata.component';
import { LessonNavigatorComponent } from '../../components/lesson-navigator/lesson-navigator.component';
import { CoreDataService } from '@core/services/core-data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-audio-mixer-bar',
  standalone: true,
  imports: [
    PlayControlsComponent,
    SpeedControlComponent,
    VolumeControlComponent,
    UnifiedMixerComponent,
    LessonMetadataComponent,
    LessonNavigatorComponent,
    FormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './audio-mixer-bar.component.html',
  styles: `
    .progress-bar-container {
      &:hover {
        height: 6px;
        .progress-handle {
          opacity: 1;
        }
      }
    }
    .progress-fill {
      box-shadow: 0 0 10px rgba(174, 199, 57, 0.4);
    }
    .progress-handle {
      pointer-events: none;
      z-index: 30;
    }
    .loop-marker {
      width: 12px;
      height: 18px; 
      background: linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%);
      position: absolute;
      top: 50%;
      pointer-events: auto;
      cursor: ew-resize;
      z-index: 25;
      border-radius: 3px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.8);
      transition: transform 0.1s ease, background 0.2s, box-shadow 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .loop-marker::before {
      content: '';
      width: 4px;
      height: 8px;
      border-left: 1px solid rgba(0,0,0,0.15);
      border-right: 1px solid rgba(0,0,0,0.15);
      opacity: 0.6;
    }
    .loop-marker:hover {
      background: #FFD54F;
      height: 20px;
      box-shadow: 0 0 10px rgba(255, 213, 79, 0.4);
    }
    .loop-marker:hover::before {
      opacity: 1;
    }
    .loop-marker::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 24px;
      height: 36px;
      background: transparent;
    }
    .progress-active-range {
      position: absolute;
      top: 0;
      height: 100%;
      background: rgba(255, 255, 255, 0.15);
      pointer-events: none;
      z-index: 10;
    }
    .settings-popin {
      background: rgba(10, 10, 10, 0.98) !important;
      box-shadow: 0 24px 64px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
    }
  `,
})
export class AudioMixerBarComponent {
  private _controlBarService = inject(ControlBarService);
  private _flatService = inject(FlatService);
  private _audioService = inject(AudioService);
  private _bridgeService = inject(BridgeService);
  private _lessonService = inject(LessonService);
  private _router = inject(Router);
  private _coreDataStore = inject(CoreDataService);
  
  isMobile = signal(window.innerWidth < 768);

  @HostListener('window:resize')
  onResize() {
    this.isMobile.set(window.innerWidth < 768);
  }

  // -- Audio Capabilities --
  readonly hasVideo = this._lessonService.hasVideo;
  readonly hasAudio = this._lessonService.hasAudio;
  readonly useMetronome = this._lessonService.useMetronome;

  isMidiMode = this._lessonService.isMidiMode;

  navigateToMode(mode: 'video' | 'metronome' | 'playback'): void {
    const mock = new URLSearchParams(window.location.search).get('mock');
    const route = mode === 'video' ? '/video-diapo' : (mode === 'metronome' ? '/metronome-diapo' : '/playback-diapo');
    this._router.navigate([route], { queryParams: { mock } });
  }

  switchToMIDI(): void {
    const mock = new URLSearchParams(window.location.search).get('mock');
    this._router.navigate(['/score-musicxml'], { queryParams: { mock } });
  }

  // -- Inputs --

  // -- Derived Signals --
  typeControlBar = this._controlBarService.controlBar;
  duration = this._audioService.duration;
  isPlaying = this._controlBarService.isPlaying;
  currentTime = this._controlBarService.time;
  
  tracks = this._audioService.tracks;
  
  showInfoPopin = signal(false);
  private _popinTimer: any;

  isDirectMode = this._lessonService.isDirectMode;

  readonly isScoreMode = computed(() => this._lessonService.diapoType() === 'xml');

  ready = computed(
    () => this._audioService.isReady() && this._flatService.isReady(),
  );

  seekTo(time: number) {
    if (time === undefined) return;
    this._audioService.seek(time);
    this._audioService.pause();
    this._flatService.seekTrackTo(time);
  }

  handlePrevious() {
    this._bridgeService.sendAction('prev');
  }

  handleNext() {
    this._bridgeService.sendAction('next');
  }

  handleTogglePlay() {
    if (this.isPlaying()) {
      this._audioService.pause();
      this._flatService.pause();
    } else {
      this._audioService.play();
      this._flatService.play();
    }
  }

  handleStepBackward() {
    if (this._flatService.loopMode()) return;
    const target = Math.max(0, this.currentTime() - 10);
    this.seekTo(target);
  }

  handleStepForward() {
    if (this._flatService.loopMode()) return;
    const target = Math.min(this.duration(), this.currentTime() + 10);
    this.seekTo(target);
  }

  handleVolumeChange(volume: number) {
    this._audioService.setVolume(volume);
  }

  async handleSpeedChange(speed: number) {
    this._audioService.seek(0);
    this._audioService.pause();
    this._flatService.seekTrackTo(0);

    this._audioService.setPlaybackRate(speed);
    await this._flatService.reinitializeTrackWithSpeed(speed);
  }

  // -- Loop State & UI --
  loopStart = this._audioService.loopStart;
  loopEnd = this._audioService.loopEnd;
  isLooping = this._audioService.isLooping;

  activePopin = signal<'none' | 'loop'>('none');
  draggingMarker = signal<'A' | 'B' | null>(null);

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  handleSeek(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newTime = parseFloat(input.value);
    this.seekTo(newTime);
  }

  // -- Loop Popin Methods --
  toggleLoopPopin(): void {
    this.showInfoPopin.set(false);
    this.activePopin.update(v => v === 'loop' ? 'none' : 'loop');
    
    if (!this.loopStart() && !this.loopEnd()) {
        const current = this.currentTime();
        this._audioService.setLoopRange(current, this.duration());
    }
  }

  closePopins(): void {
    this.activePopin.set('none');
  }

  toggleLoopActive(): void {
    if (this.isLooping()) {
        this.clearLoop();
    } else {
        this._audioService.pause();
        this._flatService.pause();
        const start = this.currentTime();
        const end = this.duration();
        this._audioService.setLoopRange(start, end);
    }
  }

  setLoopA(): void {
    const current = this.currentTime();
    this._coreDataStore.requestLoopRange(current, this.loopEnd(), 'ui');
  }

  setLoopB(): void {
    const current = this.currentTime();
    if (this.loopStart() !== null && current > this.loopStart()!) {
      this._coreDataStore.requestLoopRange(this.loopStart(), current, 'ui');
    }
  }

  clearLoop(): void {
    this._coreDataStore.requestLoopRange(null, null, 'ui');
  }

  // -- Drag Logic --
  startDrag(marker: 'A' | 'B', event: MouseEvent | TouchEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.draggingMarker.set(marker);
  }

  handleProgressBarMove(event: MouseEvent | TouchEvent): void {
    const marker = this.draggingMarker();
    if (!marker) return;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const time = percentage * this.duration();

    if (marker === 'A') {
      this._audioService.setLoopRange(time, this.loopEnd());
    } else {
      this._audioService.setLoopRange(this.loopStart(), time);
    }
  }

  stopDrag(): void {
    const marker = this.draggingMarker();
    if (marker) {
       this._coreDataStore.requestLoopRange(this.loopStart(), this.loopEnd(), 'ui');
    }
    this.draggingMarker.set(null);
  }

  toggleInfoPopin(): void {
    if (this._popinTimer) {
      clearTimeout(this._popinTimer);
    }
    
    this.closePopins();
    this.showInfoPopin.set(true);
    
    this._popinTimer = setTimeout(() => {
      this.showInfoPopin.set(false);
      this._popinTimer = null;
    }, 3000);
  }
}
