import { Component, computed, inject, input, signal, ChangeDetectionStrategy, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ControlBarService } from '../../services/control-bar.service';
import { FlatService } from '@core/services/flat.service';
import { JwpService } from '@core/services/jwp.service';
import { BridgeService } from '@core/services/bridge.service';
import { LessonService } from '@app/modules/lesson/services/lesson.service';
import { DiapoStateService } from '@core/shared/diapo/services/diapo.service';
import { LessonMetadataComponent } from '../../components/lesson-metadata/lesson-metadata.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-video-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, LessonMetadataComponent],
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
  protected  readonly isMobile = signal<boolean>(window.innerWidth < 768);

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth < 768);
  }
  protected readonly _jwpService = inject(JwpService);
  private readonly _bridgeService = inject(BridgeService);
  public readonly _lessonService = inject(LessonService);
  private readonly _diapoService = inject(DiapoStateService);
  private readonly _elementRef = inject(ElementRef);
  private readonly _router = inject(Router);

  // -- Reactive Data Sources --
  readonly hasVideo = this._lessonService.hasVideo;
  readonly hasAudio = this._lessonService.hasAudio;
  readonly useMetronome = this._lessonService.useMetronome;

  // -- Component Local State --
  activeTab = signal<'video' | 'metronome'>('video');
  showInfoPopin = signal(false);
  activePopin = signal<'none' | 'settings' | 'speed' | 'loop'>('none');
  activeMenu = signal<'main' | 'quality' | 'speed' | 'captions' | 'layout'>('main');
  private _popinTimer: any;

  // -- Draggable Loop State --
  draggingMarker = signal<'A' | 'B' | null>(null);

  // -- Reactive Derived State --
  typeControlBar = this._controlBarService.controlBar;
  durationInSec = computed(() => this._jwpService.duration() / 1000);
  currentTime = this._controlBarService.time;
  isPlaying = this._controlBarService.isPlaying;
  layoutMode = this._diapoService.layoutMode;
  sidebarPosition = this._diapoService.sidebarPosition;
  
  isDirectMode = this._lessonService.isDirectMode;
  isMuted = this._jwpService.isMuted;
  videoVolume = this._jwpService.volume;
  
  // JWPlayer Advanced Settings
  playbackRate = this._jwpService.playbackRate;
  qualityLevels = this._jwpService.qualityLevels;
  currentQuality = this._jwpService.currentQuality;
  captionsList = this._jwpService.captionsList;
  currentCaptions = this._jwpService.currentCaptions;
  
  isPip = this._jwpService.isPip;
  isLooping = this._jwpService.isLooping;
  loopStart = this._jwpService.loopStart;
  loopEnd = this._jwpService.loopEnd;
  
  hasLayoutSettings = computed(() => {
    if (this.isMobile()) return false;
    const lesson = this._lessonService.lessonJson();
    if (!lesson) return false;
    
    const hasImg = (lesson as any).loadImg === true;
    const isXml = this._lessonService.diapoType() === 'xml';
    
    console.log('[VideoBar] hasLayoutSettings check:', { hasImg, isXml, loadImg: (lesson as any).loadImg });
    return hasImg || isXml;
  });

  isVerticalLayoutAllowed = computed(() => {
    // On n'autorise le layout vertical QUE si c'est du XML
    // Cela l'isole automatiquement de la route video-diapo (qui est EPS/IMG)
    return this._lessonService.diapoType() === 'xml';
  });

  readonly isScoreMode = computed(() => this._lessonService.diapoType() === 'xml');

  readonly playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  formatTime(seconds: number): string {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  handleTogglePlay(): void {
    this.closePopins();
    this.isPlaying() ? this._jwpService.pause() : this._jwpService.play();
  }

  handlePrevious(): void {
    this.closePopins();
    this._bridgeService.sendAction('prev');
  }

  handleNext(): void {
    this.closePopins();
    this._bridgeService.sendAction('next');
  }

  handleStepBackward(): void {
    this.closePopins();
    const target = Math.max(0, this.currentTime() - 10);
    this.seekTo(target);
  }

  handleStepForward(): void {
    this.closePopins();
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

  toggleMute(): void {
    this._jwpService.toggleMute();
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

  navigateToMode(mode: 'video' | 'metronome' | 'playback'): void {
    const mock = new URLSearchParams(window.location.search).get('mock');
    const route = mode === 'video' ? '/video-diapo' : (mode === 'metronome' ? '/metronome-diapo' : '/playback-diapo');
    this._router.navigate([route], { queryParams: { mock } });
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

  // --- Click Outside Logic ---
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.activePopin() === 'none') return;
    
    // Check if the click is outside the control bar component
    const clickedInside = this._elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.closePopins();
    }
  }

  toggleSettingsPopin(): void {
    this.showInfoPopin.set(false);
    this.activePopin.update(v => v === 'settings' ? 'none' : 'settings');
    this.activeMenu.set('main');
    this.startInactivityTimer();
  }

  toggleSpeedPopin(): void {
    this.showInfoPopin.set(false);
    this.activePopin.update(v => v === 'speed' ? 'none' : 'speed');
    this.startInactivityTimer();
  }

  toggleLoopPopin(): void {
    this.showInfoPopin.set(false);
    this.activePopin.update(v => v === 'loop' ? 'none' : 'loop');
    
    if (!this.loopStart() && !this.loopEnd()) {
        const current = this.currentTime();
        this._jwpService.setLoopRange(current, this.durationInSec());
    }
    this.startInactivityTimer();
  }

  private _inactivityTimer: any;
  startInactivityTimer(): void {
    if (this._inactivityTimer) clearTimeout(this._inactivityTimer);
    this._inactivityTimer = setTimeout(() => {
      this.closePopins();
    }, 15000);
  }

  toggleLoopActive(): void {
    if (this.isLooping()) {
        this.clearLoop();
    } else {
        // A. Pause the video first as requested
        this._jwpService.pause();
        
        // B. Set pointers: A at current position, B at the very end
        const start = this.currentTime();
        const end = this.durationInSec();
        this._jwpService.setLoopRange(start, end);
    }
  }

  closePopins(): void {
    this.activePopin.set('none');
  }

  setLocalLayout(mode: any): void {
    console.log("SET LAYOUT TEST POINT", mode);
    this._diapoService.setLayoutMode(mode);
    this.closePopins();
  }

  setLocalFullLayout(mode: any, pos: any): void {
    if (this.layoutMode() === mode && this.sidebarPosition() === pos) return;
    
     console.log("SET FULL LAYOUT TEST POINT", mode);
     this._diapoService.setLayoutMode(mode);
    this._diapoService.setSidebarPosition(pos);
    // On ne ferme plus forcément la popin ici si on veut rester dans les réglages
  }

  // -- Advanced Settings Methods --
  
  setPlaybackRate(rate: number): void {
    this._jwpService.setPlaybackRate(rate);
    this.closePopins();
  }

  setQuality(index: number): void {
    this._jwpService.setCurrentQuality(index);
    // On peut rester dans le menu ou fermer selon le goût. Ici on ferme pour le moment.
    this.closePopins();
  }

  setCaptions(index: number): void {
    this._jwpService.setCurrentCaptions(index);
    this.closePopins();
  }

  togglePiP(): void {
    this._jwpService.togglePip();
  }

  // -- Loop Methods --
  setLoopA(): void {
    const current = this.currentTime();
    this._jwpService.setLoopRange(current, this.loopEnd());
  }

  setLoopB(): void {
    const current = this.currentTime();
    if (this.loopStart() !== null && current > this.loopStart()!) {
      this._jwpService.setLoopRange(this.loopStart(), current);
    }
  }

  clearLoop(): void {
    this._jwpService.setLoopRange(null, null);
  }

  navigateMenu(menu: 'main' | 'quality' | 'speed' | 'captions' | 'layout'): void {
    this.showInfoPopin.set(false);
    
    // Toggle logic: if already on this menu and settings is open, close it
    if (this.activePopin() === 'settings' && this.activeMenu() === menu) {
      this.closePopins();
      return;
    }

    if (menu === 'layout' && !this.hasLayoutSettings()) {
      this.activeMenu.set('main');
      return;
    }
    
    this.activeMenu.set(menu);
    this.activePopin.set('settings');
    this.startInactivityTimer();
  }

  // -- Drag & Drop Logic --
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
    const time = percentage * this.durationInSec();

    if (marker === 'A') {
      this._jwpService.setLoopRange(time, this.loopEnd());
    } else {
      this._jwpService.setLoopRange(this.loopStart(), time);
    }
  }

  stopDrag(): void {
    this.draggingMarker.set(null);
  }

 
}
