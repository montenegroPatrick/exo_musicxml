import { Component, computed, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { BridgeService } from '@core/services/bridge.service';
import { LessonService } from '@app/modules/lesson/services/lesson.service';
import { PlayControlsComponent } from '../../components/play-controls/play-controls.component';
import { SpeedControlComponent } from '../../components/speed-control/speed-control.component';
import { TrackMixerComponent } from '../../components/track-mixer/track-mixer.component';
import { TimelineSliderComponent } from '../../components/timeline-slider/timeline-slider.component';
import { VolumeControlComponent } from '../volume-control/volume-control.component';
import { FlatService } from '@core/services/flat.service';
import { ControlBarService } from '../../services/control-bar.service';
import { AudioService } from '@core/services/audio.service';
import { LessonMetadataComponent } from '../../components/lesson-metadata/lesson-metadata.component';

@Component({
  selector: 'app-audio-mixer-bar',
  standalone: true,
  imports: [
    PlayControlsComponent,
    SpeedControlComponent,
    VolumeControlComponent,
    TrackMixerComponent,
    TimelineSliderComponent,
    LessonMetadataComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './audio-mixer-bar.component.html',
  styles: ``,
})
export class AudioMixerBarComponent {
  private _controlBarService = inject(ControlBarService);
  private _flatService = inject(FlatService);
  private _audioService = inject(AudioService);
  private _bridgeService = inject(BridgeService);
  private _lessonService = inject(LessonService);
  private _router = inject(Router);

  // -- Audio Capabilities --
  readonly hasVideo = this._lessonService.hasVideo;
  readonly hasAudio = this._lessonService.hasAudio;
  readonly useMetronome = this._lessonService.useMetronome;

  navigateToMode(mode: 'video' | 'metronome' | 'playback'): void {
    const mock = new URLSearchParams(window.location.search).get('mock');
    const route = mode === 'video' ? '/video-diapo' : (mode === 'metronome' ? '/metronome-diapo' : '/playback-diapo');
    this._router.navigate([route], { queryParams: { mock } });
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

  toggleInfoPopin(): void {
    if (this._popinTimer) {
      clearTimeout(this._popinTimer);
    }
    
    this.showInfoPopin.set(true);
    
    this._popinTimer = setTimeout(() => {
      this.showInfoPopin.set(false);
      this._popinTimer = null;
    }, 3000);
  }
}
