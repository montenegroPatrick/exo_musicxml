import { Component, inject, signal, computed, effect, OnDestroy, ChangeDetectionStrategy, untracked, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetronomeService } from '@core/services/utils/metronome.service';
import { Router } from '@angular/router';
import { LessonService } from '@app/modules/lesson/services/lesson.service';
import { CoreDataService } from '@core/services/core-data.service';
import { BridgeService } from '@core/services/bridge.service';
import { LessonMetadataComponent } from '../../../components/lesson-metadata/lesson-metadata.component';
import { LessonNavigatorComponent } from '../../../components/lesson-navigator/lesson-navigator.component';

@Component({
  selector: 'app-metronome-bar-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule, LessonMetadataComponent, LessonNavigatorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './metronome-bar-mobile.component.html',
  styleUrls: ['./metronome-bar-mobile.component.scss'],
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class MetronomeBarMobileComponent implements OnDestroy {
  protected readonly metronomeService = inject(MetronomeService);
  private readonly _router = inject(Router);
  private readonly _lessonService = inject(LessonService);
  private readonly _coreData = inject(CoreDataService);
  private readonly _bridgeService = inject(BridgeService);
  private readonly _elementRef = inject(ElementRef);

  // -- State --
  readonly isTrainingMode = signal<boolean>(false);
  readonly trainingStep = signal<number>(5);
  readonly trainingInterval = signal<number>(4);
  private _measuresCounted = 0;
  
  showInfoPopin = signal(false);
  activePopin = signal<'none' | 'settings' | 'training'>('none');
  private _popinTimer: any;

  // -- Lesson Info --
  readonly hasVideo = this._lessonService.hasVideo;
  readonly hasAudio = this._lessonService.hasAudio;
  readonly useMetronome = this._lessonService.useMetronome;
  readonly isScoreMode = computed(() => this._lessonService.diapoType() === 'xml');
  readonly hasScore = computed(() => this._lessonService.diapoType() === 'xml' || !!this._lessonService.xmlUrl());
  readonly hasDiapo = computed(() => {
    const t = this._lessonService.diapoType();
    return !!t && t !== 'xml';
  });

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
  switchToMedia(): void {
    const mock = new URLSearchParams(window.location.search).get('mock');
    const route = this.hasVideo() ? '/video-diapo' : '/playback-diapo';
    this._router.navigate([route], { queryParams: { mock } });
  }

  handlePrevious(): void {
    this.closePopins();
    this._bridgeService.sendAction('prev');
  }

  handleNext(): void {
    this.closePopins();
    this._bridgeService.sendAction('next');
  }

  // -- Metronome Controls --
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
  toggleInfoPopin(): void {
    if (this._popinTimer) clearTimeout(this._popinTimer);
    this.closePopins();
    this.showInfoPopin.set(true);
    this._popinTimer = setTimeout(() => {
      this.showInfoPopin.set(false);
      this._popinTimer = null;
    }, 3000);
  }

  togglePopin(popin: 'settings' | 'training'): void {
    this.showInfoPopin.set(false);
    this.activePopin.update(v => v === popin ? 'none' : popin);
  }

  closePopins(): void {
    this.activePopin.set('none');
    this.showInfoPopin.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.activePopin() === 'none' && !this.showInfoPopin()) return;
    const clickedInside = this._elementRef.nativeElement.contains(event.target);
    if (!clickedInside) this.closePopins();
  }

  ngOnDestroy(): void {
    this.metronomeService.stop();
    if (this._popinTimer) clearTimeout(this._popinTimer);
  }
}
