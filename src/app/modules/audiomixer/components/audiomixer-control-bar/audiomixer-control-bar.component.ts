import { Component, inject, computed, signal, effect, input, ChangeDetectionStrategy, ElementRef, HostListener, untracked } from '@angular/core';
import { Router } from '@angular/router';
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
  
  hasVideo = this._lessonService.hasVideo;
  hasAudio = this._lessonService.hasAudio;
  isScoreMode = computed(() => this._lessonService.diapoType() === 'xml');
  hasScore = computed(() => this._lessonService.diapoType() === 'xml' || !!this._lessonService.xmlUrl());
  hasDiapo = computed(() => {
    const t = this._lessonService.diapoType();
    return !!t && t !== 'xml';
  });
  
  mixerVisible = this._mixerState.mixerVisible;
  isLooping = this._audioService.isLooping;
  loopStart = this._audioService.loopStart;
  loopEnd = this._audioService.loopEnd;

  // -- Local state --
  private _router = inject(Router);
  private _elementRef = inject(ElementRef);
  
  seekbarValue = 0;
  isDragging = signal<boolean>(false);
  draggingMarker = signal<'A' | 'B' | null>(null);
  readonly playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];
  
  activePopin = signal<'none' | 'speed'>('none');
  private _inactivityTimer: any;

  constructor() {
    // Sync seekbar locally when not dragging
    effect(() => {
      const current = this.currentTime();
      if (!this.isDragging()) {
        untracked(() => {
          this.seekbarValue = current;
        });
      }
    });
  }

  togglePlay() {
    if (this.isPlaying()) this._audioService.pause();
    else this._audioService.play();
  }

  handlePrevious() { this._bridgeService.sendAction('prev'); }

  handleNext() { this._bridgeService.sendAction('next'); }

  handleStep(offset: number) {
    this._audioService.seek(this.currentTime() + offset);
  }

  startDragging() {
    this.isDragging.set(true);
  }

  onSeekEnd() {
    if (this.isLooping()) {
      const start = this.loopStart();
      const end = this.loopEnd();
      if (start !== null && end !== null) {
        if (this.seekbarValue < start || this.seekbarValue > end) {
          // If user seeks outside the loop range, clear the loop and the visual selection
          this._coreDataStore.requestLoopRange(null, null, 'ui');
          this._audioService.setLoopRange(null, null);
        }
      }
    }
    this._audioService.seek(this.seekbarValue);
    this.isDragging.set(false);
  }

  setPlaybackRate(rate: number) {
    this._audioService.setPlaybackRate(rate);
    this.closePopins();
  }
  
  toggleSpeedPopin(): void {
    this.activePopin.update(v => v === 'speed' ? 'none' : 'speed');
    this.startInactivityTimer();
  }

  closePopins(): void {
    this.activePopin.set('none');
  }

  startInactivityTimer(): void {
    if (this._inactivityTimer) clearTimeout(this._inactivityTimer);
    this._inactivityTimer = setTimeout(() => {
      this.closePopins();
    }, 15000);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.activePopin() === 'none') return;
    const clickedInside = this._elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.closePopins();
    }
  }

  navigateToMode(mode: 'video' | 'metronome' | 'playback'): void {
    const mock = new URLSearchParams(window.location.search).get('mock');
    const route = mode === 'metronome' ? '/metronome-diapo' : 
                  (mode === 'playback' ? '/playback-diapo' : '/video-diapo');
    this._router.navigate([route], { queryParams: { mock } });
  }

  switchToMIDI(): void {
    const mock = new URLSearchParams(window.location.search).get('mock');
    this._router.navigate(['/score-musicxml'], { queryParams: { mock } });
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
       const start = this.loopStart();
       const end = this.loopEnd();
       // Set the loop range directly to bypass the UI request that triggers clearSelection
       if (start !== null && end !== null) {
           this._audioService.setLoopRange(start, end);
           
           // Snap playhead to loop start if dragged A, or if we are before the loop
           const current = this.currentTime();
           if (marker === 'A' || current < start) {
             this._audioService.seek(start);
           } else if (marker === 'B' && current > end) {
             this._audioService.seek(start);
           }
       }
    }
    this.draggingMarker.set(null);
  }
}
