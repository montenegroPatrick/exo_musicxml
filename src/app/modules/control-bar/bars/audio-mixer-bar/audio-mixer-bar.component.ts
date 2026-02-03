import { Component, computed, effect, inject } from '@angular/core';
import { LessonService } from '@app/modules/lesson/services/lesson.service';
import { PlayControlsComponent } from '../../components/play-controls/play-controls.component';
import { SpeedControlComponent } from '../../components/speed-control/speed-control.component';
import { TrackMixerComponent } from '../../components/track-mixer/track-mixer.component';
import { TimelineSliderComponent } from '../../components/timeline-slider/timeline-slider.component';
import { VolumeControlComponent } from '../volume-control/volume-control.component';
import { FlatService } from '@core/services/flat.service';
import { ControlBarService } from '../../services/control-bar.service';
import { AudioService } from '@core/services/audio.service';

@Component({
  selector: 'app-audio-mixer-bar',
  imports: [
    PlayControlsComponent,
    SpeedControlComponent,
    VolumeControlComponent,
    TrackMixerComponent,
    TimelineSliderComponent,
  ],
  templateUrl: './audio-mixer-bar.component.html',
  styles: ``,
})
export class AudioMixerBarComponent {
  private _controlBarService = inject(ControlBarService);
  private _flatService = inject(FlatService);
  private _audioService = inject(AudioService);
  typeControlBar = computed(() => this._controlBarService.controlBar());
  duration = computed(() => this._audioService.duration());
  track = computed(() => this._audioService.tracks());

  ready = computed(
    () => this._audioService.isReady() && this._flatService.isReady(),
  );

  seekTo(time: number) {
    if (time == undefined) return;
    this._audioService.seek(time);
    this._controlBarService.isPlaying.set(false);
    this._audioService.pause();
    this._flatService.seekTrackTo(time);
  }

  handleTogglePlay() {
    if (this._controlBarService.isPlaying()) {
      this._controlBarService.isPlaying.set(false);
      this._audioService.pause();
      this._flatService.pause();
    } else {
      this._controlBarService.isPlaying.set(true);
      this._audioService.play();
      this._flatService.play();
    }
  }

  handleStepBackward() {
    if (this._flatService.loopMode()) return;
    const currentTime = this._controlBarService.time();
    this.seekTo(Math.max(0, currentTime - 10));
    this._controlBarService.time.set(currentTime - 10);
  }

  handleStepForward() {
    if (this._flatService.loopMode()) return;
    const currentTime = this._controlBarService.time();
    this.seekTo(Math.min(this.duration(), currentTime + 10));
    this._controlBarService.time.set(currentTime + 10);
  }

  handleVolumeChange(volume: number) {
    this._audioService.setVolume(volume);
  }

  async handleSpeedChange(speed: number) {
    this._audioService.seek(0);
    this._controlBarService.time.set(0);
    this._audioService.pause();
    this._flatService.seekTrackTo(0);

    this._controlBarService.isPlaying.set(false);
    this._audioService.setPlaybackRate(speed);
    await this._flatService.reinitializeTrackWithSpeed(speed);
  }
}
