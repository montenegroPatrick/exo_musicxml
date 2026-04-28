import { Component, inject, computed, signal, effect, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AudioService } from '@core/services/audio.service';
import { LessonService } from '../../../lesson/services/lesson.service';
import { BridgeService } from '@core/services/bridge.service';
import { AudioMixerStateService } from '../../services/audio-mixer-state.service';
import { TrackTimePipe } from '../../pipes/track-time.pipe';
import { LessonMetadataComponent } from '../../../control-bar/components/lesson-metadata/lesson-metadata.component';
import { CoreDataService } from '@core/services/core-data.service';

@Component({
  selector: 'app-audiomixer-control-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TrackTimePipe, LessonMetadataComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './audiomixer-control-bar.component.html',
  styleUrl: './audiomixer-control-bar.component.css'
})
export class AudioMixerControlBarComponent {
  private _audioService = inject(AudioService);
  private _lessonService = inject(LessonService);
  private _bridgeService = inject(BridgeService);
  private _mixerState = inject(AudioMixerStateService);
  private _coreDataStore = inject(CoreDataService);

  // -- Inputs --

  // -- Signals mapping --
  isPlaying = this._audioService.isPlaying;
  duration = this._audioService.duration;
  currentTime = this._audioService.currentTime;
  playbackRate = this._audioService.playbackRate;
  isDirectMode = this._lessonService.isDirectMode;
  
  mixerVisible = this._mixerState.mixerVisible;
  isLooping = this._audioService.isLooping;
  loopStart = this._audioService.loopStart;
  loopEnd = this._audioService.loopEnd;

  // -- Local state --
  seekbarValue = 0;
  isDragging = signal<boolean>(false);
  draggingMarker = signal<'A' | 'B' | null>(null);
  private speeds = [0.5, 0.75, 1, 1.25, 1.5];

  constructor() {
    // Sync seekbar locally when not dragging
    effect(() => {
      const time = this.currentTime();
      if (!this.isDragging()) {
        this.seekbarValue = time;
      }
    });
  }

  togglePlay() {
    console.log('[ControlBar] togglePlay() click!');
    this.isPlaying() ? this._audioService.pause() : this._audioService.play();
  }

  handlePrevious() {
    this._bridgeService.sendAction('prev');
  }

  handleNext() {
    this._bridgeService.sendAction('next');
  }

  handleStep(delta: number) {
    const newTime = Math.max(0, Math.min(this.duration(), this.currentTime() + delta));
    this._audioService.seek(newTime);
  }

  startDragging() {
    this.isDragging.set(true);
  }

  onSeekEnd() {
    this._audioService.seek(this.seekbarValue);
    this.isDragging.set(false);
  }

  cycleSpeed() {
    const current = this.playbackRate();
    const idx = this.speeds.indexOf(current);
    const nextIdx = (idx + 1) % this.speeds.length;
    this._audioService.setPlaybackRate(this.speeds[nextIdx]);
  }

  toggleMixer() {
    this._mixerState.toggleMixer();
  }

  toggleLoopActive() {
    if (this.isLooping()) {
      this._coreDataStore.requestLoopRange(null, null, 'ui');
    } else {
      // Pause first
      this._audioService.pause();
      
      // Set pointers
      const start = this.currentTime();
      const end = this.duration();
      this._coreDataStore.requestLoopRange(start, end, 'ui');
    }
  }

  startDrag(marker: 'A' | 'B', event: MouseEvent | TouchEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.draggingMarker.set(marker);
  }

  handleProgressBarMove(event: MouseEvent | TouchEvent) {
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

  stopDrag() {
    const marker = this.draggingMarker();
    if (marker) {
       this._coreDataStore.requestLoopRange(this.loopStart(), this.loopEnd(), 'ui');
    }
    this.draggingMarker.set(null);
  }
}
