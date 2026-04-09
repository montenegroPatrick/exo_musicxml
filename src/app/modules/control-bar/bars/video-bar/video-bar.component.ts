import { Component, computed, inject, input, signal } from '@angular/core';
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
  templateUrl: './video-bar.component.html',
  styleUrls: ['./video-bar.component.scss'],
})
export class VideoBarComponent {
  private _controlBarService = inject(ControlBarService);
  private _flatService = inject(FlatService);
  private _jwpService = inject(JwpService);
  private _bridgeService = inject(BridgeService);
  private _lessonService = inject(LessonService);

  showNavigation = input<boolean>(true);

  // States
  activeTab = signal<'video' | 'metronome'>('video');
  showVolumeSlider = signal(false);
  showInfoPopin = signal(false);
  private _popinTimer: any;

  // Computed data from services
  typeControlBar = computed(() => this._controlBarService.controlBar());
  duration = computed(() => this._jwpService.duration() / 1000);
  currentTime = computed(() => this._controlBarService.time());
  isPlaying = computed(() => this._controlBarService.isPlaying());
  
  // Lesson Metadata
  chapterTitle = computed(() => this._lessonService.chapterTitle());
  subChapterTitle = computed(() => this._lessonService.subChapterTitle());
  sequenceTitle = computed(() => this._lessonService.sequenceTitle());

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  handleTogglePlay() {
    if (this.isPlaying()) {
      this._jwpService.pause();
    } else {
      this._jwpService.play();
    }
  }

  handlePrevious() {
    this._bridgeService.sendAction('prev');
  }

  handleNext() {
    this._bridgeService.sendAction('next');
  }

  handleStepBackward() {
    this.seekTo(Math.max(0, this.currentTime() - 10));
  }

  handleStepForward() {
    this.seekTo(Math.min(this.duration(), this.currentTime() + 10));
  }

  seekTo(time: number) {
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
