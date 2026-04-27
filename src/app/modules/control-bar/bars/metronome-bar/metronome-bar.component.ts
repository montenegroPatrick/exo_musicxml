import { Component, inject, signal, computed, effect, OnDestroy, ChangeDetectionStrategy, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetronomeService } from '@core/services/utils/metronome.service';
import { Router } from '@angular/router';
import { LessonService } from '@app/modules/lesson/services/lesson.service';

import { CoreDataService } from '@core/services/core-data.service';
import { LessonMetadataComponent } from '../../components/lesson-metadata/lesson-metadata.component';
import { LessonNavigatorComponent } from '../../components/lesson-navigator/lesson-navigator.component';

@Component({
  selector: 'app-metronome-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, LessonMetadataComponent, LessonNavigatorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './metronome-bar.component.html',
  styleUrls: ['./metronome-bar.component.scss']
})
export class MetronomeBarComponent implements OnDestroy {
  protected readonly metronomeService = inject(MetronomeService);
  private readonly _router = inject(Router);
  private readonly _lessonService = inject(LessonService);
  private readonly _coreData = inject(CoreDataService);

  readonly isScoreMode = computed(() => this._lessonService.diapoType() === 'xml');

  // -- State --
  readonly isTrainingMode = signal<boolean>(false);
  readonly trainingStep = signal<number>(5);
  readonly trainingInterval = signal<number>(4);
  private _measuresCounted = 0;
  activePopin = signal<'none' | 'settings' | 'training'>('none');

  // -- Lesson Info --
  readonly chapterTitle = this._coreData.chapterTitle;
  readonly sequenceTitle = this._coreData.sequenceTitle;

  constructor() {
    // Initialisation BPM depuis JSON
    effect(() => {
      const lesson = this._coreData.lessonJson() as any;
      if (lesson) {
        const jsonBpm = lesson.bpm || 80;
        untracked(() => this.metronomeService.setBpm(jsonBpm));
      }
    }, { allowSignalWrites: true });

    // Monitor beats for training mode
    effect(() => {
      const currentBeat = this.metronomeService.currentBeat();
      const isPlaying = this.metronomeService.isPlaying();
      
      if (isPlaying && this.isTrainingMode() && currentBeat === 0) {
        untracked(() => {
          this._measuresCounted++;
          if (this._measuresCounted >= this.trainingInterval()) {
            this._measuresCounted = 0;
            this.metronomeService.setBpm(this.metronomeService.bpm() + this.trainingStep());
          }
        });
      }

      if (!isPlaying) {
        this._measuresCounted = 0;
      }
    });
  }

  // -- Navigation --
  switchToVideo(): void {
    const mock = new URLSearchParams(window.location.search).get('mock');
    this._router.navigate(['/video-diapo'], { queryParams: { mock } });
  }

  // Proxy for metadata buttons if needed
  handlePrevious(): void { /* Optional: bridge to lesson nav */ }
  handleNext(): void { /* Optional: bridge to lesson nav */ }

  // -- Metronome Controls --
  togglePlay(): void {
    this.metronomeService.togglePlay();
  }

  stop(): void {
    this.metronomeService.stop();
  }

  handleMainAction(): void {
    if (this.isTrainingMode()) {
       this.metronomeService.togglePlay();
    } else {
       if (this.metronomeService.isPlaying()) {
         this.metronomeService.stop();
       } else {
         this.metronomeService.start();
       }
    }
  }

  changeBpm(amount: number): void {
    this.metronomeService.setBpm(this.metronomeService.bpm() + amount);
  }

  onBpmInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.metronomeService.setBpm(Number(val));
  }

  // Local Tap Tempo Implementation
  private _lastTap = 0;
  private _tapTimes: number[] = [];
  tapTempo(): void {
    const now = Date.now();
    if (this._lastTap > 0) {
      const diff = now - this._lastTap;
      if (diff < 2000) {
        this._tapTimes.push(diff);
        if (this._tapTimes.length > 5) this._tapTimes.shift();
        const avg = this._tapTimes.reduce((a, b) => a + b) / this._tapTimes.length;
        this.metronomeService.setBpm(Math.round(60000 / avg));
      } else {
        this._tapTimes = [];
      }
    }
    this._lastTap = now;
  }

  setDivision(s: number | 'shuffle'): void {
    if (s === 'shuffle') {
      this.metronomeService.setSubdivision(3);
      this.metronomeService.setShuffle(true);
    } else {
      this.metronomeService.setSubdivision(s);
      this.metronomeService.setShuffle(false);
    }
  }

  // -- Popin Controls --
  togglePopin(popin: 'settings' | 'training'): void {
    this.activePopin.update(v => v === popin ? 'none' : popin);
  }

  closePopins(): void {
    this.activePopin.set('none');
  }

  ngOnDestroy(): void {
    this.metronomeService.stop();
  }
}
