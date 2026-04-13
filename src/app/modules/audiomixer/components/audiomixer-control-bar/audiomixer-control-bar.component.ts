import { Component, inject, computed, signal, effect, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AudioService } from '@core/services/audio.service';
import { LessonService } from '../../../lesson/services/lesson.service';
import { BridgeService } from '@core/services/bridge.service';
import { AudioMixerStateService } from '../../services/audio-mixer-state.service';
import { TrackTimePipe } from '../../pipes/track-time.pipe';

@Component({
  selector: 'app-audiomixer-control-bar-v2',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TrackTimePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- MAIN CONTAINER: Red Background -->
    <div class="audiomixer-control-bar relative flex flex-row items-center justify-between px-6 w-full text-white h-full shadow-[0_-4px_12px_rgba(0,0,0,0.2)]">
      
      <!-- SEEK BAR -->
      <div class="progress-bar-container group absolute top-0 left-0 w-full h-[3px] bg-white/20 cursor-pointer overflow-visible z-[100]">
        <input type="range"
               class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
               [min]="0"
               [max]="duration() || 100"
               step="0.1"
               [(ngModel)]="seekbarValue"
               (mousedown)="startDragging()"
               (mouseup)="onSeekEnd()"
               (touchstart)="startDragging()"
               (touchend)="onSeekEnd()">
        
        <!-- Progress Fill -->
        <div class="progress-fill absolute top-0 left-0 h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.5)]"
             [style.width.%]="(currentTime() / (duration() || 1)) * 100">
        </div>
        
        <!-- Progress Handle -->
        <div class="progress-handle absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
             [style.left.%]="(currentTime() / (duration() || 1)) * 100">
        </div>
      </div>

      <!-- LEFT: Navigation & Metadata -->
      <div class="flex items-center min-w-0 flex-1">
        @if (showNavigation()) {
          <div class="nav-group flex items-center gap-6 pr-6 border-r border-white/30 h-10">
            <button class="hover:scale-110 active:scale-90 transition-transform text-white bg-transparent border-none p-0 flex items-center" (click)="handlePrevious()">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button class="hover:scale-110 active:scale-90 transition-transform text-white bg-transparent border-none p-0 flex items-center" (click)="handleNext()">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6z"/></svg>
            </button>
          </div>
        }

        <div class="lesson-info flex flex-col justify-center min-w-0" [class.pl-6]="showNavigation()">
          @if (displayMode() === 'score') {
            <span class="score-title text-base font-bold text-white truncate leading-tight">
              {{ titre() }}
            </span>
            <div class="flex items-center gap-2 text-[11px] text-white/70 italic truncate">
              <span>{{ compositeur() }}</span>
              <span class="not-italic opacity-40" *ngIf="compositeur() && producteur()">|</span>
              <span class="uppercase not-italic text-[9px] tracking-widest">{{ producteur() }}</span>
            </div>
          } @else {
            <div class="flex flex-col">
               <span class="chapter-info uppercase text-[9px] text-white/70 font-semibold tracking-wider truncate">
                  {{ chapterTitle() }}
                </span>
                <span class="sequence-title text-base font-bold text-white leading-tight truncate">
                  {{ sequenceTitle() }}
                </span>
                <span class="subchapter-info text-[11px] text-white/80 italic font-light truncate">
                  {{ subChapterTitle() }}
                </span>
            </div>
          }
        </div>
      </div>

      <!-- CENTER: Playback Center -->
      <div class="controls-center flex items-center gap-6 flex-shrink-0">
        <button class="text-white/70 hover:text-white transition-colors bg-transparent border-none p-0" (click)="handleStep(-10)">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>
        </button>

        <button class="play-button flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-all border-none p-0 cursor-pointer backdrop-blur-md" 
                (click)="togglePlay()">
          @if (isPlaying()) {
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
          }
        </button>

        <button class="text-white/70 hover:text-white transition-colors bg-transparent border-none p-0" (click)="handleStep(10)">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>
        </button>

        <div class="time-display flex items-center gap-1.5 text-sm font-medium tabular-nums ml-2">
          <span class="text-white">{{ currentTime() | trackTime }}</span>
          <span class="text-white/40">/</span>
          <span class="text-white/60">{{ duration() | trackTime }}</span>
        </div>
      </div>

      <!-- RIGHT: Speed & Mixer -->
      <div class="controls-right flex items-center gap-4 flex-1 justify-end">
        <button class="speed-btn flex items-center justify-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-xs font-bold border-none text-white ring-1 ring-white/10"
                (click)="cycleSpeed()">
          <span class="uppercase tracking-tighter opacity-70">Speed</span>
          <span class="w-8">{{ playbackRate() }}x</span>
        </button>

        <button class="mixer-btn w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/20 transition-all bg-transparent border-none p-0 text-white"
                [class.bg-white/20]="mixerVisible()"
                (click)="toggleMixer()"
                title="Table de mixage">
           <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
           </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .audiomixer-control-bar {
      background: #FA5E46;
    }
    .progress-bar-container {
      transition: height 0.2s ease;
      &:hover { height: 8px; .progress-handle { opacity: 1; } }
    }
    input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      height: 100%;
      background: transparent;
      outline: none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
    }
  `]
})
export class AudioMixerControlBarComponent {
  private _audioService = inject(AudioService);
  private _lessonService = inject(LessonService);
  private _bridgeService = inject(BridgeService);
  private _mixerState = inject(AudioMixerStateService);

  // -- Inputs --
  showNavigation = input<boolean>(true);

  // -- Signals mapping --
  isPlaying = this._audioService.isPlaying;
  duration = this._audioService.duration;
  currentTime = this._audioService.currentTime;
  playbackRate = this._audioService.playbackRate;
  
  chapterTitle = this._lessonService.chapterTitle;
  subChapterTitle = this._lessonService.subChapterTitle;
  sequenceTitle = this._lessonService.sequenceTitle;
  titre = this._lessonService.titre;
  compositeur = this._lessonService.compositeur;
  producteur = this._lessonService.producteur;

  mixerVisible = this._mixerState.mixerVisible;
  
  displayMode = computed<'score' | 'lesson'>(() => this.titre() ? 'score' : 'lesson');

  // -- Local state --
  seekbarValue = 0;
  isDragging = signal<boolean>(false);
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
}
