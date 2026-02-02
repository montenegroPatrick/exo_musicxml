import { Component, computed, inject } from '@angular/core';
import { ControlBarService } from '../../services/control-bar.service';
import { FlatService } from '@core/services/flat.service';
import { JwpService } from '@core/services/jwp.service';
import { PlayControlsComponent } from '../../components/play-controls/play-controls.component';
import { TimelineSliderComponent } from '../../components/timeline-slider/timeline-slider.component';
import { VolumeControlComponent } from '../volume-control/volume-control.component';
import { SpeedControlComponent } from '../../components/speed-control/speed-control.component';
import { SubtitleSettingsComponent } from '../../components/subtitle-settings/subtitle-settings.component';
import { FullscreenToggleComponent } from '../../components/fullscreen-toggle/fullscreen-toggle.component';

@Component({
  selector: 'app-video-bar',
  imports: [
    PlayControlsComponent,
    TimelineSliderComponent,
    VolumeControlComponent,
    SpeedControlComponent,
    SubtitleSettingsComponent,
    FullscreenToggleComponent,
  ],
  templateUrl: './video-bar.component.html',
})
export class VideoBarComponent {
  private _controlBarService = inject(ControlBarService);
  private _flatService = inject(FlatService);
  private _jwpService = inject(JwpService);

  typeControlBar = computed(() => this._controlBarService.controlBar());
  duration = computed(() => this._jwpService.duration() / 1000);

  seekTo(time: number) {
    if (time == undefined) return;
    this._jwpService.seek(time);
    if (this.typeControlBar() === 'video-xml') {
      this._flatService.seekTrackTo(time);
    }
  }

  handleTogglePlay() {
    if (this._controlBarService.isPlaying()) {
      this._jwpService.pause();
    } else {
      this._jwpService.play();
    }
  }

  handleStepBackward() {
    const currentTime = this._controlBarService.time();
    this.seekTo(Math.max(0, currentTime - 10));
  }

  handleStepForward() {
    const currentTime = this._controlBarService.time();
    this.seekTo(Math.min(this.duration(), currentTime + 10));
  }

  handleVolumeChange(volume: number) {
    this._jwpService.setVolume(volume);
  }

  handleSpeedChange(speed: number) {
    this._jwpService.setPlaybackRate(speed);
  }

  handleSubtitleChange(trackId: string | null) {
    if (trackId) {
      this._jwpService.enableCaptions(trackId);
    } else {
      this._jwpService.disableCaptions();
    }
  }

  handleFullscreenChange(isFullscreen: boolean) {
    if (isFullscreen) {
      this._jwpService.enterFullscreen();
    } else {
      this._jwpService.exitFullscreen();
    }
  }
}
