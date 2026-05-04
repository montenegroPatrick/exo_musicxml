import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild,
  HostListener
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TapRythmService } from './services/tap-rythm.service';
import { ExerciseStateService } from './services/exercise-state.service';
import { TimerService } from './services/timer.service';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { ExerciseResultsComponent } from './components/exercise-results/exercise-results.component';
import { TapVisualizerComponent } from './components/tap-visualizer/tap-visualizer.component';
import { TapButtonComponent } from './components/tap-button/tap-button.component';
import { Level } from './interface/flat.interface';
import { ButtonModule } from 'primeng/button';
import { TapEvaluationService } from '@app/modules/tap-rythm/services/tap-evaluation.service';
import { SoundService } from 'src/core/services/utils/sound-service.service';
import {
  L10N_LOCALE,
  L10nTranslatePipe,
  L10nTranslationService,
} from 'angular-l10n';
import { OnboardingService } from '../../../core/services/utils/onboarding.service';
import { BridgeService } from '../../../core/services/bridge.service';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { FlatService } from '@core/services/flat.service';

@Component({
  standalone: true,
  selector: 'app-tap-rythm',
  imports: [
    ErrorMessageComponent,
    ExerciseResultsComponent,
    TapVisualizerComponent,
    ButtonModule,
    L10nTranslatePipe,
    FormsModule,
  ],
  templateUrl: './tap-rythm.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TapRythmPageComponent implements AfterViewInit, OnDestroy {
  readonly locale = inject(L10N_LOCALE);
  readonly translationService = inject(L10nTranslationService);
  
  @ViewChild('flatContainer') private readonly _flatContainer!: ElementRef<HTMLDivElement>;

  // -- Services --
  private readonly _tapRythmService = inject(TapRythmService);
  private readonly _flatService = inject(FlatService);
  private readonly _tapEvaluationService = inject(TapEvaluationService);
  private readonly _soundService = inject(SoundService);
  private readonly _onboardingService = inject(OnboardingService);
  private readonly _bridgeService = inject(BridgeService);
  private readonly _route = inject(ActivatedRoute);

  readonly exerciseState = inject(ExerciseStateService);
  readonly timer = inject(TimerService);

  // -- Private State --
  private readonly _currentSequence = signal<string>('7');
  private readonly _parts = signal<any[]>([]);
  readonly isTapping = signal<boolean>(false);

  // -- Reactive Mappings --
  readonly hasFinePointer = window.matchMedia('(pointer: fine)').matches;
  readonly xmlContent = this._tapRythmService.musicXml;
  readonly jsonContent = this._tapRythmService.jsonXml;
  readonly isXmlError = this._tapRythmService.isError;
  
  readonly totalDurationMs = computed(() => this.jsonContent().duration ?? 100000);
  readonly partsSignal = this._parts.asReadonly();

  async ngAfterViewInit(): Promise<void> {
    const seq = this._route.snapshot.params['seq'] || '7';
    this._currentSequence.set(seq);

    await this._initializeFlat();
    this._initEmbedEvents();
  }

  private async _initializeFlat(): Promise<void> {
    this._flatService.disableInitHack = true;
    this._flatService.initEmbed(this._flatContainer.nativeElement, {
      controlsDisplay: false,
      playbackMetronome: 'active',
      layout: 'responsive',
    });

    this._soundService.initAudioContext();
    await this._flatService.loadMusicXML(this.xmlContent());

    const nbMeasures = await this._flatService.getNbMeasures();
    this.exerciseState.setNbMeasures(nbMeasures ?? 0);
    this.exerciseState.setXmlIsLoaded(true);

    await this._flatService.setMetronomeMode(1);

    const details = await this._flatService.getMeasureDetails();
    if (details) {
      const arr = Array.isArray(details) ? details : [details];
      const bpm = arr[0]?.tempo?.bpm || 120;
      const beats = arr[0]?.timeSignature?.beats || 4;
      this.exerciseState.setOriginalBpm(bpm);
      this.exerciseState.setTimeSignatureBeats(beats);
      
      const countInMs = (60000 / bpm) * beats;
      this.exerciseState.setCountInMs(countInMs);
    }

    if (this.exerciseState.level() !== 1) {
      const level = this.exerciseState.level();
      await this._flatService.setPlaybackSpeed(level);
      this._tapRythmService.changeSpeedNotes(level);
    }

    // Sync persisted settings
    await this._flatService.setMasterVolume(this.exerciseState.masterVolume());
    await this._flatService.setPlaybackSpeed(this.exerciseState.level());

    this._flatService.onPlay(() => {
      if (this.exerciseState.isListening() || this.exerciseState.exerciseStatus() === 'playing') {
        const countInMs = this.exerciseState.countInMs() || 0;
        const beats = this.exerciseState.timeSignatureBeats();
        
        if (countInMs > 0 && beats > 0) {
          const msPerBeat = countInMs / beats;
          let currentBeat = 1;
          this.exerciseState.setVisualCountInBeat(currentBeat);
          
          const interval = setInterval(() => {
            currentBeat++;
            if (currentBeat > beats) {
              clearInterval(interval);
              this.exerciseState.setVisualCountInBeat(0);
            } else {
              this.exerciseState.setVisualCountInBeat(currentBeat);
            }
          }, msPerBeat);

          setTimeout(() => {
            if (this.exerciseState.isPlaying()) {
              this.timer.start();
            }
          }, countInMs);
        } else {
          this.timer.start();
        }
      }
    });
  }

  private _initEmbedEvents(): void {
    this._flatService.getParts().then((parts: any) => this._parts.set(parts || []));

    this._flatService.onPause(() => {
      this.timer.stop();
      this.exerciseState.setIsPlaying(false);
    });

    this._flatService.onStop(() => {
      this.timer.stop();

      if (this.timer.currentTimeMs() >= this.totalDurationMs()) {
        this._tapEvaluationService.evaluateMissedTap(this.exerciseState.userTaps());
        this.exerciseState.setExerciseStatus('finish');
      } else {
        this.exerciseState.setExerciseStatus('not-started');
      }

      this.exerciseState.calculateResult();
      this.exerciseState.setIsPlaying(false);
    });
  }

  // -- Core Exercise Logic --

  startExercise(): void {
    this.exerciseState.resetTaps();
    this.timer.reset();
    this.exerciseState.setExerciseStatus('playing');
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      event.preventDefault();
      this.handleUserTap(event);
    }
  }

  handleUserTap(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
    
    if (!this.exerciseState.canTap()) return;
    
    this.isTapping.set(true);
    setTimeout(() => this.isTapping.set(false), 80);

    const tapMs = this.timer.currentTimeMs();
    this._soundService.playTapSound();
    
    const notes = this.jsonContent().notes ?? [];
    this.exerciseState.recordTap(tapMs, notes);
  }

  async toggleListen(): Promise<void> {
    const listening = this.exerciseState.isListening();
    
    if (listening) {
      await this._flatService.stop();
    } else {
      await this._flatService.play();
      const firstPart = this._parts()[0];
      if (firstPart?.uuid) {
        await this._flatService.setPartVolume(firstPart.uuid, 100);
      }
    }
    
    this.exerciseState.setIsListening(!listening);
  }

  async handlePlayStop(): Promise<void> {
    if (this.exerciseState.isPlaying()) {
      await this._flatService.stop();
      this.resetExercise();
    } else {
      await this._flatService.play();
      if (!this.exerciseState.isListening()) {
        this.startExercise();
      }

      // Small delay to ensure player is ready for volume adjustments
      setTimeout(async () => {
        const firstPart = this._parts()[0];
        if (firstPart?.uuid) {
          const vol = this.exerciseState.partSound() ? 100 : 0;
          await this._flatService.setPartVolume(firstPart.uuid, vol);
        }
      }, 500);
    }
  }

  resetExercise(): void {
    this.exerciseState.reset();
    this.timer.reset();
  }

  handleContinue(): void {
    this._bridgeService.sendAction('next');
  }

  handleDownloadLog(): void {
    const notes = this.jsonContent().notes ?? [];
    this.exerciseState.exportEvaluationLog(notes);
  }

  ngOnDestroy(): void {
    this._flatService.destroyEmbed();
  }
}
