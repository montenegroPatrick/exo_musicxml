import { Component, computed, inject, input, signal, ChangeDetectionStrategy } from '@angular/core';
import { ControlBarService } from '../../services/control-bar.service';
import { FlatService } from '@core/services/flat.service';
import { JwpService } from '@core/services/jwp.service';
import { BridgeService } from '@core/services/bridge.service';
import { LessonService } from '@app/modules/lesson/services/lesson.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-video-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-bar.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `],
  styleUrls: ['./video-bar.component.scss'],
})
export class VideoBarComponent {
  // Services
  protected readonly _controlBarService = inject(ControlBarService);
  protected readonly _flatService = inject(FlatService);
  protected readonly _jwpService = inject(JwpService);
  private readonly _bridgeService = inject(BridgeService);
  public readonly _lessonService = inject(LessonService);

  // -- Inputs --
  showNavigation = input<boolean>(true);

  // -- Component Local State --
  activeTab = signal<'video' | 'metronome'>('video');
  showInfoPopin = signal(false);
  private _popinTimer: any;

  // -- Reactive Derived State --
  typeControlBar = this._controlBarService.controlBar;
  durationInSec = computed(() => this._jwpService.duration() / 1000);
  currentTime = this._controlBarService.time;
  isPlaying = this._controlBarService.isPlaying;
  
  // Metadata Signals
  chapterTitle = this._lessonService.chapterTitle;
  subChapterTitle = this._lessonService.subChapterTitle;
  sequenceTitle = this._lessonService.sequenceTitle;

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  handleTogglePlay(): void {
    this.isPlaying() ? this._jwpService.pause() : this._jwpService.play();
  }

  handlePrevious(): void {
    this._bridgeService.sendAction('prev');
  }

  handleNext(): void {
    this._bridgeService.sendAction('next');
  }

  handleStepBackward(): void {
    const target = Math.max(0, this.currentTime() - 10);
    this.seekTo(target);
  }

  handleStepForward(): void {
    const target = Math.min(this.durationInSec(), this.currentTime() + 10);
    this.seekTo(target);
  }

  seekTo(time: number): void {
    if (time === undefined) return;
    this._jwpService.seek(time);
    if (this.typeControlBar() === 'video-xml') {
      this._flatService.seekTrackTo(time);
    }
  }

  handleSeek(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newTime = parseFloat(input.value);
    this.seekTo(newTime);
  }

  handleVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const volume = parseFloat(input.value);
    this._jwpService.setVolume(volume);
  }

  toggleFullscreen(): void {
    if (document.fullscreenElement) {
      this._jwpService.exitFullscreen();
    } else {
      this._jwpService.enterFullscreen();
    }
  }

  setTab(tab: 'video' | 'metronome'): void {
    this.activeTab.set(tab);
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
