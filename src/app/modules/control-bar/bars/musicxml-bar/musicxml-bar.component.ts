import { Component, inject, computed, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlatService } from '@core/services/flat.service';
import { TrackTimePipe } from '../../../audiomixer/pipes/track-time.pipe';
import { ControlBarService } from '../../services/control-bar.service';
import { LessonMetadataComponent } from '../../components/lesson-metadata/lesson-metadata.component';
import { MidiMixerStateService } from '../../../score-musicxml/services/midi-mixer-state.service';

import { MidiTempoComponent } from './components/midi-tempo.component';
import { Router } from '@angular/router';
import { LessonService } from '@app/modules/lesson/services/lesson.service';
@Component({
  selector: 'app-musicxml-bar',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    LessonMetadataComponent,
    MidiTempoComponent
  ],
  templateUrl: './musicxml-bar.component.html',
  styleUrl: './musicxml-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicXMLBarComponent {
  private _flatService = inject(FlatService);
  private _controlBarService = inject(ControlBarService);
  private _mixerState = inject(MidiMixerStateService);
  private readonly _router = inject(Router);
  private readonly _lessonService = inject(LessonService);
  
  // -- Media Signals --
  readonly hasVideo = this._lessonService.hasVideo;
  readonly hasAudio = this._lessonService.hasAudio;
  readonly hasDiapo = computed(() => {
    const t = this._lessonService.diapoType();
    return !!t && t !== 'xml';
  });
  
  // -- Signals mapping --
  isPlaying = this._controlBarService.isPlaying;
  duration = this._flatService.duration;
  currentTime = this._flatService.time;
  playbackRate = this._flatService.currentSpeed;
  
  mixerVisible = this._mixerState.mixerVisible;
  isDirectMode = signal(false);
  metronomeMode = signal(0);
  settingsVisible = signal(false);
  zoomValue = signal(100);

  // -- Local state for seekbar --
  seekbarValue = 0;
  isDragging = signal<boolean>(false);

  constructor() {
    // Sync seekbar locally when not dragging
    effect(() => {
      const time = this.currentTime();
      if (!this.isDragging()) {
        this.seekbarValue = time;
      }
    });

    // Initial metronome mode sync
    this._flatService.getMetronomeMode().then(m => this.metronomeMode.set(m));
  }

  togglePlay(): void {
    this.isPlaying() ? this._flatService.pause() : this._flatService.play();
  }

  toggleMixer(): void {
    this._mixerState.toggleMixer();
  }

  toggleSettings(): void {
    this.settingsVisible.update(v => !v);
  }

  closePopins(): void {
    this.settingsVisible.set(false);
  }

  async setMetronomeMode(mode: number) {
    this.metronomeMode.set(mode);
    await this._flatService.setMetronomeMode(mode);
  }

  async cycleMetronomeMode() {
    const next = (this.metronomeMode() + 1) % 3;
    this.setMetronomeMode(next);
  }

  handlePrint() {
    this._flatService.print();
  }

  onZoomSliderChange(val: number) {
    this.zoomValue.set(val);
    const multiplier = val / 100;
    this._flatService.setZoom(multiplier);
  }

  startDragging() { this.isDragging.set(true); }
  onSeekEnd() {
    this._flatService.seekTrackTo(this.seekbarValue);
    this.isDragging.set(false);
  }

  handlePrevious() { /* Delegate to LessonNavigator logic if needed */ }
  handleNext() { /* Delegate to LessonNavigator logic if needed */ }

  switchToMedia(): void {
    const mock = new URLSearchParams(window.location.search).get('mock');
    const route = this.hasVideo() ? '/video-score' : '/playback-score';
    this._router.navigate([route], { queryParams: { mock } });
  }
}
